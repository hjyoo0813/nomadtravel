import { Place, Accommodation, TripConfig, DailyItinerary, ScheduledEvent, RouteSegment, OptimizationResult, TransportMode } from './types.js';

// Helper: Convert "HH:MM" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper: Convert minutes from midnight to "HH:MM"
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Helper: Calculate Haversine distance between two coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Estimate travel time and distance
export function estimateTravel(
  from: Place,
  to: Place,
  mode: TransportMode
): RouteSegment {
  const dist = calculateDistanceKm(
    from.location.lat,
    from.location.lng,
    to.location.lat,
    to.location.lng
  );

  let speedKmH = 40;
  let overheadMin = 0;

  switch (mode) {
    case 'car':
      speedKmH = 45;
      overheadMin = 5;
      break;
    case 'walking':
      speedKmH = 4.5;
      overheadMin = 0;
      break;
    case 'transit':
      speedKmH = 20;
      overheadMin = 12;
      break;
    case 'custom':
      speedKmH = 30;
      overheadMin = 5;
      break;
  }

  let durationMin = (dist / speedKmH) * 60 + overheadMin;
  if (dist > 0.05) {
    durationMin = Math.max(durationMin, mode === 'walking' ? 2 : 5);
  } else {
    durationMin = 0;
  }

  return {
    fromPlaceId: from.id,
    toPlaceId: to.id,
    transportMode: mode,
    distanceKm: Math.round(dist * 100) / 100,
    durationMin: Math.round(durationMin),
  };
}

export function optimizeItinerary(config: TripConfig): OptimizationResult {
  const { startDate, endDate, accommodations, places, transportMode } = config;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 1. Separate places
  const allAccommodations = places.filter((p) => p.category === 'Accommodation');
  const fixedEvents = places.filter((p) => p.isFixed && p.category !== 'Accommodation');
  const normalPlaces = places.filter((p) => !p.isFixed && p.category !== 'Accommodation');

  // Generate daily date strings
  const dateStrings: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dateStrings.push(d.toISOString().split('T')[0]);
  }

  // 2. Identify anchors for each day (Accommodations & Fixed events)
  const dailyAnchors: Place[][] = Array.from({ length: totalDays }, () => []);
  for (let d = 0; d < totalDays; d++) {
    // Start Accommodation: night of day d-1 (for d > 0), else default to night 0's accommodation
    const prevNightAcc = accommodations.find((a) => a.dateIndex === d - 1);
    const currNightAcc = accommodations.find((a) => a.dateIndex === d);
    
    const startAccId = prevNightAcc?.placeId || currNightAcc?.placeId;
    if (startAccId) {
      const p = allAccommodations.find((acc) => acc.id === startAccId);
      if (p) dailyAnchors[d].push(p);
    }

    // End Accommodation: night of day d
    if (currNightAcc) {
      const p = allAccommodations.find((acc) => acc.id === currNightAcc.placeId);
      if (p) dailyAnchors[d].push(p);
    }

    // Fixed events on day d
    const dayFixed = fixedEvents.filter((f) => f.reservationTime?.dateIndex === d);
    dailyAnchors[d].push(...dayFixed);
  }

  // 3. Cluster and assign normal (non-fixed) places to days
  // We compute the minimum distance from each place to each day's anchors.
  const assignedPlacesByDay: Place[][] = Array.from({ length: totalDays }, () => []);
  const excludedPlaces: { placeId: string; reason: string }[] = [];

  for (const place of normalPlaces) {
    let bestDayIndex = -1;
    let minDistance = Infinity;

    for (let d = 0; d < totalDays; d++) {
      const anchors = dailyAnchors[d];
      if (anchors.length === 0) continue;

      // Calculate distance to nearest anchor of day d
      for (const anchor of anchors) {
        const dist = calculateDistanceKm(
          place.location.lat,
          place.location.lng,
          anchor.location.lat,
          anchor.location.lng
        );
        if (dist < minDistance) {
          minDistance = dist;
          bestDayIndex = d;
        }
      }
    }

    if (bestDayIndex !== -1) {
      assignedPlacesByDay[bestDayIndex].push(place);
    } else {
      excludedPlaces.push({
        placeId: place.id,
        reason: '방문을 매칭할 기준 숙소나 고정 일정이 이 날짜에 존재하지 않습니다.',
      });
    }
  }

  // 4. Optimize routes day-by-day
  const itineraries: DailyItinerary[] = [];

  for (let d = 0; d < totalDays; d++) {
    const dateStr = dateStrings[d];
    
    // Find accommodations
    const prevNightAcc = accommodations.find((a) => a.dateIndex === d - 1);
    const currNightAcc = accommodations.find((a) => a.dateIndex === d);

    const startAccId = prevNightAcc?.placeId || currNightAcc?.placeId;
    const endAccId = currNightAcc?.placeId || startAccId;

    const startAcc = allAccommodations.find((acc) => acc.id === startAccId);
    const endAcc = allAccommodations.find((acc) => acc.id === endAccId);

    // If no start/end accommodations, fall back to first available place or airport
    if (!startAcc || !endAcc) {
      itineraries.push({ dateIndex: d, dateStr, events: [] });
      continue;
    }

    // Get fixed events for day d
    const dayFixedEvents = fixedEvents
      .filter((f) => f.reservationTime?.dateIndex === d)
      .sort((a, b) => {
        const aStart = timeToMinutes(a.reservationTime!.start);
        const bStart = timeToMinutes(b.reservationTime!.start);
        return aStart - bStart;
      });

    // Get assigned candidates for day d
    const dayCandidates = assignedPlacesByDay[d];

    // Define Day Travel Windows
    // Normally 09:00 (540 min) to 22:00 (1320 min), unless fixed events start earlier/later
    let dayStartTime = 540; // 09:00
    let dayEndTime = 1320;  // 22:00

    if (dayFixedEvents.length > 0) {
      const firstFixedStart = timeToMinutes(dayFixedEvents[0].reservationTime!.start);
      // Give buffer for travel from start accommodation
      const travelToFirst = estimateTravel(startAcc, dayFixedEvents[0], transportMode).durationMin;
      dayStartTime = Math.min(dayStartTime, firstFixedStart - travelToFirst - 10);
      dayStartTime = Math.max(dayStartTime, 0); // clamp

      const lastFixedEnd = timeToMinutes(dayFixedEvents[dayFixedEvents.length - 1].reservationTime!.end);
      const travelFromLast = estimateTravel(dayFixedEvents[dayFixedEvents.length - 1], endAcc, transportMode).durationMin;
      dayEndTime = Math.max(dayEndTime, lastFixedEnd + travelFromLast + 10);
      dayEndTime = Math.min(dayEndTime, 1439); // clamp
    }

    // Run Backtracking Optimization Solver
    const optimizedRoute = solveDailyBacktracking(
      startAcc,
      endAcc,
      dayFixedEvents,
      dayCandidates,
      dayStartTime,
      dayEndTime,
      transportMode
    );

    // Build the itinerary events
    const dayEvents: ScheduledEvent[] = [];
    
    // Add start accommodation
    dayEvents.push({
      placeId: startAcc.id,
      arrivalTime: minutesToTime(dayStartTime),
      departureTime: minutesToTime(dayStartTime),
      durationMin: 0,
      isFixed: true,
      type: 'accommodation_start',
    });

    let prevPlace = startAcc;
    let currTime = dayStartTime;

    for (let i = 0; i < optimizedRoute.length; i++) {
      const visitPlace = optimizedRoute[i];
      const travel = estimateTravel(prevPlace, visitPlace, transportMode);
      
      // Travel event
      const travelArr = currTime + travel.durationMin;
      
      let visitArr = travelArr;
      if (visitPlace.isFixed && visitPlace.reservationTime) {
        visitArr = timeToMinutes(visitPlace.reservationTime.start);
      } else {
        visitArr = Math.max(travelArr, timeToMinutes(visitPlace.openingHours.start));
      }

      // Add travel details to previous event
      if (dayEvents.length > 0) {
        dayEvents[dayEvents.length - 1].travelToNext = travel;
      }

      // Wait event if arrived early
      if (visitArr > travelArr) {
        // Option to explicitly log wait, but we can bundle it or just adjust arrival
      }

      const visitDep = visitArr + (visitPlace.isFixed && visitPlace.reservationTime 
        ? (timeToMinutes(visitPlace.reservationTime.end) - timeToMinutes(visitPlace.reservationTime.start))
        : visitPlace.duration);

      dayEvents.push({
        placeId: visitPlace.id,
        arrivalTime: minutesToTime(visitArr),
        departureTime: minutesToTime(visitDep),
        durationMin: visitDep - visitArr,
        isFixed: visitPlace.isFixed,
        type: 'visit',
      });

      prevPlace = visitPlace;
      currTime = visitDep;
    }

    // End Accommodation Travel
    const finalTravel = estimateTravel(prevPlace, endAcc, transportMode);
    if (dayEvents.length > 0) {
      dayEvents[dayEvents.length - 1].travelToNext = finalTravel;
    }

    dayEvents.push({
      placeId: endAcc.id,
      arrivalTime: minutesToTime(currTime + finalTravel.durationMin),
      departureTime: minutesToTime(currTime + finalTravel.durationMin),
      durationMin: 0,
      isFixed: true,
      type: 'accommodation_end',
    });

    itineraries.push({
      dateIndex: d,
      dateStr,
      events: dayEvents,
    });

    // Determine excluded places for this day
    const scheduledIds = new Set(optimizedRoute.map((p) => p.id));
    for (const cand of dayCandidates) {
      if (!scheduledIds.has(cand.id)) {
        // Compute exclusion reason
        const reason = determineExclusionReason(cand, startAcc, endAcc, dayFixedEvents, dayStartTime, dayEndTime, transportMode);
        excludedPlaces.push({
          placeId: cand.id,
          reason,
        });
      }
    }
  }

  // Also verify if any fixed event got excluded (e.g. conflicting reservations)
  const scheduledFixedIds = new Set(itineraries.flatMap((it) => it.events.filter((e) => e.isFixed && e.type === 'visit').map((e) => e.placeId)));
  for (const f of fixedEvents) {
    if (!scheduledFixedIds.has(f.id)) {
      excludedPlaces.push({
        placeId: f.id,
        reason: '고정 예약 일정이 다른 예약 시간과 겹치거나, 숙소로부터의 이동 시간이 절대적으로 부족합니다.',
      });
    }
  }

  return {
    itineraries,
    excludedPlaces,
  };
}

// Backtracking solver
function solveDailyBacktracking(
  startAcc: Place,
  endAcc: Place,
  fixedEvents: Place[],
  candidates: Place[],
  startTime: number,
  endTime: number,
  mode: TransportMode
): Place[] {
  let bestRoute: Place[] = [];
  let maxCount = -1;
  let minTravelTime = Infinity;

  // Pre-calculate travel segment cache to speed up
  const cacheKey = (p1: string, p2: string) => `${p1}_${p2}`;
  const travelCache = new Map<string, RouteSegment>();
  
  function getCachedTravel(p1: Place, p2: Place): RouteSegment {
    const key = cacheKey(p1.id, p2.id);
    if (!travelCache.has(key)) {
      travelCache.set(key, estimateTravel(p1, p2, mode));
    }
    return travelCache.get(key)!;
  }

  // Backtracking function
  // We build the schedule chronologically, tracking:
  // - currentTime: current time in minutes
  // - currentPlace: where we are
  // - visitedCandidates: set of normal candidate IDs we've visited
  // - currentRoute: list of Places visited
  // - fixedIndex: which fixed event we must satisfy next
  function search(
    currentTime: number,
    currentPlace: Place,
    visitedCandidates: Set<string>,
    currentRoute: Place[],
    fixedIndex: number
  ) {
    // 1. Visit Next Fixed Event
    if (fixedIndex < fixedEvents.length) {
      const nextFixed = fixedEvents[fixedIndex];
      const fixedStart = timeToMinutes(nextFixed.reservationTime!.start);
      const fixedEnd = timeToMinutes(nextFixed.reservationTime!.end);
      const travel = getCachedTravel(currentPlace, nextFixed);

      // Try visiting some candidate before the next fixed event
      for (const cand of candidates) {
        if (visitedCandidates.has(cand.id)) continue;
        if (currentRoute.length >= 8) continue; // MVP limit

        const travelToCand = getCachedTravel(currentPlace, cand);
        const candArr = Math.max(currentTime + travelToCand.durationMin, timeToMinutes(cand.openingHours.start));
        const candDep = candArr + cand.duration;
        const travelToFixed = getCachedTravel(cand, nextFixed);
        const fixedArr = candDep + travelToFixed.durationMin;

        // Is it feasible?
        if (
          candArr <= timeToMinutes(cand.openingHours.end) &&
          candDep <= timeToMinutes(cand.openingHours.end) &&
          fixedArr <= fixedStart
        ) {
          visitedCandidates.add(cand.id);
          currentRoute.push(cand);

          search(candDep, cand, visitedCandidates, currentRoute, fixedIndex);

          currentRoute.pop();
          visitedCandidates.delete(cand.id);
        }
      }

      // Or travel directly to the next fixed event
      if (currentTime + travel.durationMin <= fixedStart) {
        currentRoute.push(nextFixed);
        search(fixedEnd, nextFixed, visitedCandidates, currentRoute, fixedIndex + 1);
        currentRoute.pop();
      }

    } else {
      // 2. All Fixed Events satisfied! Can visit more candidates or wrap up.
      
      // Try visiting remaining candidates
      let branchesExplored = 0;
      for (const cand of candidates) {
        if (visitedCandidates.has(cand.id)) continue;
        if (currentRoute.length >= 8) continue; // MVP limit

        const travelToCand = getCachedTravel(currentPlace, cand);
        const candArr = Math.max(currentTime + travelToCand.durationMin, timeToMinutes(cand.openingHours.start));
        const candDep = candArr + cand.duration;
        const travelToEnd = getCachedTravel(cand, endAcc);

        if (
          candArr <= timeToMinutes(cand.openingHours.end) &&
          candDep <= timeToMinutes(cand.openingHours.end) &&
          candDep + travelToEnd.durationMin <= endTime
        ) {
          branchesExplored++;
          visitedCandidates.add(cand.id);
          currentRoute.push(cand);

          search(candDep, cand, visitedCandidates, currentRoute, fixedIndex);

          currentRoute.pop();
          visitedCandidates.delete(cand.id);
        }
      }

      // If no more candidates can be visited, finalize the day route
      if (branchesExplored === 0 || currentRoute.length >= 8) {
        const travelToEnd = getCachedTravel(currentPlace, endAcc);
        const finalTime = currentTime + travelToEnd.durationMin;

        if (finalTime <= endTime) {
          // Count only normal places + fixed events (exclude start/end acc)
          const normalVisitedCount = currentRoute.filter(p => !p.isFixed).length;
          
          let totalTravelMin = 0;
          let tempPlace = startAcc;
          for (const p of currentRoute) {
            totalTravelMin += getCachedTravel(tempPlace, p).durationMin;
            tempPlace = p;
          }
          totalTravelMin += getCachedTravel(tempPlace, endAcc).durationMin;

          if (
            normalVisitedCount > maxCount ||
            (normalVisitedCount === maxCount && totalTravelMin < minTravelTime)
          ) {
            maxCount = normalVisitedCount;
            minTravelTime = totalTravelMin;
            bestRoute = [...currentRoute];
          }
        }
      }
    }
  }

  // Start Search
  search(startTime, startAcc, new Set(), [], 0);

  return bestRoute;
}

// Helper: Determine why a place was excluded
function determineExclusionReason(
  place: Place,
  startAcc: Place,
  endAcc: Place,
  fixedEvents: Place[],
  startTime: number,
  endTime: number,
  mode: TransportMode
): string {
  // Test 1: Can we fit this place ALONE on this day?
  const travelFromStart = estimateTravel(startAcc, place, mode);
  const arr = Math.max(startTime + travelFromStart.durationMin, timeToMinutes(place.openingHours.start));
  const dep = arr + place.duration;
  const travelToEnd = estimateTravel(place, endAcc, mode);

  if (arr > timeToMinutes(place.openingHours.end)) {
    return '장소의 영업시간이 하루 활성 시간과 어긋납니다.';
  }

  if (dep + travelToEnd.durationMin > endTime) {
    return '하루 일정 시간(09:00~22:00) 내에 방문하기에 시간이 부족하거나 숙소와의 거리가 멉니다.';
  }

  // Test 2: Does it conflict with fixed schedules?
  if (fixedEvents.length > 0) {
    let fitsInGaps = false;
    
    // Check gap before first fixed event
    const firstFixed = fixedEvents[0];
    const firstStart = timeToMinutes(firstFixed.reservationTime!.start);
    const travelToFixed = estimateTravel(place, firstFixed, mode);
    if (dep + travelToFixed.durationMin <= firstStart) {
      fitsInGaps = true;
    }

    // Check gap after last fixed event
    const lastFixed = fixedEvents[fixedEvents.length - 1];
    const lastEnd = timeToMinutes(lastFixed.reservationTime!.end);
    const travelFromFixed = estimateTravel(lastFixed, place, mode);
    const arrPostFixed = Math.max(lastEnd + travelFromFixed.durationMin, timeToMinutes(place.openingHours.start));
    if (arrPostFixed <= timeToMinutes(place.openingHours.end) && arrPostFixed + place.duration + travelToEnd.durationMin <= endTime) {
      fitsInGaps = true;
    }

    // Check gaps between consecutive fixed events
    for (let i = 0; i < fixedEvents.length - 1; i++) {
      const f1 = fixedEvents[i];
      const f2 = fixedEvents[i+1];
      const f1End = timeToMinutes(f1.reservationTime!.end);
      const f2Start = timeToMinutes(f2.reservationTime!.start);

      const t1 = estimateTravel(f1, place, mode);
      const t2 = estimateTravel(place, f2, mode);

      const arrMid = Math.max(f1End + t1.durationMin, timeToMinutes(place.openingHours.start));
      const depMid = arrMid + place.duration;

      if (arrMid <= timeToMinutes(place.openingHours.end) && depMid + t2.durationMin <= f2Start) {
        fitsInGaps = true;
      }
    }

    if (!fitsInGaps) {
      return '고정 예약 일정(항공/식사/액티비티 등) 사이에 적절한 이동 및 체류 시간을 확보할 수 없습니다.';
    }
  }

  return '동선 및 일정 시간 조율 상 제외되었습니다 (일일 8개 방문 제한 또는 다른 장소 방문에 따른 시간 부족).';
}
