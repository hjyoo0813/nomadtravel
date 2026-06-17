import { TripConfig } from '../types.js';

export const DEMO_PRESETS: Record<string, TripConfig> = {
  scenario1: {
    id: 'jeju-sc1',
    title: '제주도 & 우도 힐링 여행 (4박 5일)',
    countries: ['KR'],
    cities: ['제주', '우도'],
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    transportMode: 'car',
    accommodations: [
      { dateIndex: 0, placeId: 'jeju-acc-1' }, // 1일차 밤: 애월 숙소
      { dateIndex: 1, placeId: 'jeju-acc-1' }, // 2일차 밤: 애월 숙소
      { dateIndex: 2, placeId: 'jeju-acc-2' }, // 3일차 밤: 우도 숙소
      { dateIndex: 3, placeId: 'jeju-acc-2' }, // 4일차 밤: 우도 숙소
      { dateIndex: 4, placeId: 'jeju-acc-2' }  // 5일차 밤: 우도 숙소 (실제 4박이므로 4일차까지 유효)
    ],
    places: [
      // 숙소
      {
        id: 'jeju-acc-1',
        name: '애월 바다정원 펜션',
        category: 'Accommodation',
        location: { lat: 33.4650, lng: 126.3200, address: '제주 제주시 애월읍 애월해안로 456', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 0,
        isFixed: true
      },
      {
        id: 'jeju-acc-2',
        name: '우도 솔바람 리조트',
        category: 'Accommodation',
        location: { lat: 33.5042, lng: 126.9546, address: '제주 제주시 우도면 우도해안길 789', city: '우도', timezone: 'Asia/Seoul' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 0,
        isFixed: true
      },
      // 공항 (시작점용 터미널)
      {
        id: 'jeju-airport',
        name: '제주국제공항 (도착)',
        category: 'TransitTerminal',
        location: { lat: 33.5113, lng: 126.4930, address: '제주 제주시 공항로 2', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 30,
        reservationTime: { start: '09:00', end: '09:30', dateIndex: 0 },
        isFixed: true
      },
      // 일반 장소들 (맛집, 카페, 관광지)
      {
        id: 'jeju-cafe-1',
        name: '몽상드 애월 (카페)',
        category: 'Cafe',
        location: { lat: 33.4623, lng: 126.3101, address: '제주 제주시 애월읍 애월북서길 56-1', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '09:00', end: '20:00' },
        duration: 90,
        isFixed: false
      },
      {
        id: 'jeju-sight-1',
        name: '한라산 영실코스',
        category: 'Sightseeing',
        location: { lat: 33.3617, lng: 126.5292, address: '제주 서귀포시 영실로 246', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '06:00', end: '16:00' },
        duration: 240,
        isFixed: false
      },
      {
        id: 'jeju-rest-1',
        name: '자매국수 (고기국수)',
        category: 'Restaurant',
        location: { lat: 33.5165, lng: 126.5240, address: '제주 제주시 탑동로 11-1', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '09:00', end: '18:00' },
        duration: 60,
        isFixed: false
      },
      {
        id: 'jeju-sight-2',
        name: '협재해수욕장',
        category: 'Sightseeing',
        location: { lat: 33.3938, lng: 126.2396, address: '제주 제주시 한림읍 한림로 329-10', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 90,
        isFixed: false
      },
      {
        id: 'jeju-rest-2',
        name: '돈사돈 (흑돼지 연탄구이)',
        category: 'Restaurant',
        location: { lat: 33.4795, lng: 126.4815, address: '제주 제주시 우평로 19', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '12:00', end: '22:00' },
        duration: 90,
        isFixed: false
      },
      {
        id: 'jeju-sight-3',
        name: '성산일출봉',
        category: 'Sightseeing',
        location: { lat: 33.4586, lng: 126.9422, address: '제주 서귀포시 성산읍 성산리 1', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '07:30', end: '19:00' },
        duration: 120,
        isFixed: false
      },
      {
        id: 'udo-cafe-1',
        name: '우도 블랑로쉐 (땅콩아이스크림)',
        category: 'Cafe',
        location: { lat: 33.5170, lng: 126.9600, address: '제주 제주시 우도면 우도해안길 783', city: '우도', timezone: 'Asia/Seoul' },
        openingHours: { start: '10:00', end: '17:30' },
        duration: 60,
        isFixed: false
      },
      {
        id: 'udo-sight-1',
        name: '검멀레해변',
        category: 'Sightseeing',
        location: { lat: 33.4975, lng: 126.9678, address: '제주 제주시 우도면 우도해안길 1132', city: '우도', timezone: 'Asia/Seoul' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 80,
        isFixed: false
      },
      // 고정 예약 액티비티들
      {
        id: 'jeju-act-riding',
        name: '어승생 승마장 (승마 체험)',
        category: 'Activity',
        location: { lat: 33.3934, lng: 126.4938, address: '제주 제주시 1100로 2636', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '09:00', end: '18:00' },
        duration: 120,
        reservationTime: { start: '10:00', end: '12:00', dateIndex: 1 }, // 2일차 오전 승마
        isFixed: true
      },
      {
        id: 'jeju-act-scuba',
        name: '서귀포 문섬 스킨스쿠버 투어',
        category: 'Activity',
        location: { lat: 33.2384, lng: 126.5617, address: '제주 서귀포시 서홍동 서귀포항', city: '제주', timezone: 'Asia/Seoul' },
        openingHours: { start: '08:00', end: '18:00' },
        duration: 180,
        reservationTime: { start: '13:30', end: '16:30', dateIndex: 2 }, // 3일차 오후 스킨스쿠버
        isFixed: true
      }
    ]
  },

  scenario2: {
    id: 'tokyo-sc2',
    title: '도쿄 트렌디 쇼핑 & 미식 여행 (3박 4일)',
    countries: ['JP'],
    cities: ['도쿄'],
    startDate: '2026-08-10',
    endDate: '2026-08-13',
    transportMode: 'walking', // 지하철 및 도보 중심
    accommodations: [
      { dateIndex: 0, placeId: 'tokyo-hotel' },
      { dateIndex: 1, placeId: 'tokyo-hotel' },
      { dateIndex: 2, placeId: 'tokyo-hotel' },
      { dateIndex: 3, placeId: 'tokyo-hotel' }
    ],
    places: [
      {
        id: 'tokyo-hotel',
        name: '그레이서리 신주쿠 호텔',
        category: 'Accommodation',
        location: { lat: 35.6953, lng: 139.7020, address: '1-19-1 Kabukicho, Shinjuku, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 0,
        isFixed: true
      },
      {
        id: 'tokyo-airport',
        name: '하네다 국제공항 (도착)',
        category: 'TransitTerminal',
        location: { lat: 35.5494, lng: 139.7798, address: 'Haneda Airport, Ota City, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 45,
        reservationTime: { start: '10:30', end: '11:15', dateIndex: 0 },
        isFixed: true
      },
      {
        id: 'tokyo-rest-ramen',
        name: '이치란 라멘 신주쿠점',
        category: 'Restaurant',
        location: { lat: 35.6908, lng: 139.7015, address: '3-34-11 Shinjuku, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '10:00', end: '23:00' },
        duration: 50,
        isFixed: false
      },
      {
        id: 'tokyo-sight-shibuya',
        name: '시부야 스크램블 교차로',
        category: 'Sightseeing',
        location: { lat: 35.6595, lng: 139.7004, address: 'Shibuya, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 60,
        isFixed: false
      },
      {
        id: 'tokyo-shop-ginza',
        name: '긴자 미츠코시 백화점',
        category: 'Shopping',
        location: { lat: 35.6715, lng: 139.7650, address: '4-6-16 Ginza, Chuo City, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '10:00', end: '20:00' },
        duration: 120,
        isFixed: false
      },
      {
        id: 'tokyo-sight-meiji',
        name: '메이지 신궁',
        category: 'Sightseeing',
        location: { lat: 35.6764, lng: 139.6993, address: '1-1 Yoyogikamizonocho, Shibuya, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '05:20', end: '18:00' },
        duration: 90,
        isFixed: false
      },
      {
        id: 'tokyo-shop-akiba',
        name: '아키하바라 라디오회관',
        category: 'Shopping',
        location: { lat: 35.6980, lng: 139.7715, address: '1-15-16 Sotokanda, Chiyoda City, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '10:00', end: '20:00' },
        duration: 120,
        isFixed: false
      },
      // 고정 예약 일정들
      {
        id: 'tokyo-act-teamlab',
        name: '팀랩 플래닛 도요스 (전시 관람)',
        category: 'Activity',
        location: { lat: 35.6491, lng: 139.7946, address: '6-1-16 Toyosu, Koto City, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '09:00', end: '22:00' },
        duration: 150,
        reservationTime: { start: '14:30', end: '17:00', dateIndex: 1 }, // 2일차 오후 팀랩 전시
        isFixed: true
      },
      {
        id: 'tokyo-rest-dinner',
        name: '긴자 가이세키 요리 젠 (저녁 예약)',
        category: 'Restaurant',
        location: { lat: 35.6720, lng: 139.7665, address: '5-8-20 Ginza, Chuo City, Tokyo', city: '도쿄', timezone: 'Asia/Tokyo' },
        openingHours: { start: '17:00', end: '22:00' },
        duration: 120,
        reservationTime: { start: '18:30', end: '20:30', dateIndex: 2 }, // 3일차 저녁 가이세키 코스 요리 예약
        isFixed: true
      }
    ]
  },

  scenario3: {
    id: 'spain-sc3',
    title: '스페인 2대 도시 예술 여행 (7박 8일)',
    countries: ['ES'],
    cities: ['바르셀로나', '마드리드'],
    startDate: '2026-09-10',
    endDate: '2026-09-17',
    transportMode: 'transit', // 도시 간 기차 이동 및 대중교통
    accommodations: [
      { dateIndex: 0, placeId: 'bcn-hotel' }, // 1일차 바르셀로나
      { dateIndex: 1, placeId: 'bcn-hotel' }, // 2일차 바르셀로나
      { dateIndex: 2, placeId: 'bcn-hotel' }, // 3일차 바르셀로나
      { dateIndex: 3, placeId: 'bcn-hotel' }, // 4일차 바르셀로나
      { dateIndex: 4, placeId: 'mad-hotel' }, // 5일차 마드리드 이동 후 숙소 변경
      { dateIndex: 5, placeId: 'mad-hotel' }, // 6일차 마드리드
      { dateIndex: 6, placeId: 'mad-hotel' }, // 7일차 마드리드
      { dateIndex: 7, placeId: 'mad-hotel' }  // 8일차 마드리드
    ],
    places: [
      // 숙소 1: 바르셀로나
      {
        id: 'bcn-hotel',
        name: 'H10 메트로폴리탄 바르셀로나',
        category: 'Accommodation',
        location: { lat: 41.3882, lng: 2.1691, address: 'Rambla de Catalunya, 7, 08007 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 0,
        isFixed: true
      },
      // 숙소 2: 마드리드
      {
        id: 'mad-hotel',
        name: '호텔 리우 플라자 에스파냐 마드리드',
        category: 'Accommodation',
        location: { lat: 40.4227, lng: -3.7121, address: 'C/ Gran Via, 84, Centro, 28013 Madrid', city: '마드리드', timezone: 'Europe/Madrid' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 0,
        isFixed: true
      },
      // 바르셀로나 일정 및 장소들
      {
        id: 'bcn-airport',
        name: '바르셀로나 엘프라트 공항 (도착)',
        category: 'TransitTerminal',
        location: { lat: 41.2974, lng: 2.0833, address: '08820 El Prat de Llobregat, Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 60,
        reservationTime: { start: '13:00', end: '14:00', dateIndex: 0 },
        isFixed: true
      },
      {
        id: 'bcn-sagrada',
        name: '사그라다 파밀리아 성당 (예약)',
        category: 'Sightseeing',
        location: { lat: 41.4036, lng: 2.1744, address: 'C/ de Mallorca, 401, L\'Eixample, 08013 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '09:00', end: '20:00' },
        duration: 150,
        reservationTime: { start: '10:00', end: '12:30', dateIndex: 1 }, // 2일차 고정 예약 입장
        isFixed: true
      },
      {
        id: 'bcn-park-guell',
        name: '구엘 공원',
        category: 'Sightseeing',
        location: { lat: 41.4145, lng: 2.1527, address: 'Gracia, 08024 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '09:30', end: '19:30' },
        duration: 120,
        isFixed: false
      },
      {
        id: 'bcn-rest-tapas',
        name: '시우다드 콘달 (타파스 맛집)',
        category: 'Restaurant',
        location: { lat: 41.3888, lng: 2.1643, address: 'Rambla de Catalunya, 18, 08007 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '12:00', end: '23:30' },
        duration: 90,
        isFixed: false
      },
      {
        id: 'bcn-camp-nou',
        name: '캄프 누 (바르샤 구장)',
        category: 'Sightseeing',
        location: { lat: 41.3809, lng: 2.1228, address: 'C. d\'Arístides Maillol, 12, Les Corts, 08028 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '09:30', end: '18:00' },
        duration: 120,
        isFixed: false
      },
      {
        id: 'bcn-show-flamenco',
        name: '플라멩코 공연 (레이알 광장)',
        category: 'Activity',
        location: { lat: 41.3801, lng: 2.1737, address: 'Plaça Reial, 17, Ciutat Vella, 08002 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '18:00', end: '23:00' },
        duration: 120,
        reservationTime: { start: '20:00', end: '22:00', dateIndex: 2 }, // 3일차 저녁 플라멩코 관람 예약
        isFixed: true
      },
      // 바르셀로나 -> 마드리드 고정 도시 이동 일정 (4일차 기차 고정 등록)
      {
        id: 'transit-bcn-sants',
        name: '바르셀로나 산츠역 (기차 출발)',
        category: 'TransitTerminal',
        location: { lat: 41.3792, lng: 2.1401, address: 'Plaça dels Països Catalans, 08014 Barcelona', city: '바르셀로나', timezone: 'Europe/Madrid' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 30,
        reservationTime: { start: '09:00', end: '09:30', dateIndex: 4 }, // 5일차(인덱스4) 오전 기차 탑승
        isFixed: true
      },
      {
        id: 'transit-mad-atocha',
        name: '마드리드 아토차역 (기차 도착)',
        category: 'TransitTerminal',
        location: { lat: 40.4063, lng: -3.6917, address: 'Pl. del Emperador Carlos V, Arganzuela, 28045 Madrid', city: '마드리드', timezone: 'Europe/Madrid' },
        openingHours: { start: '00:00', end: '23:59' },
        duration: 30,
        reservationTime: { start: '12:15', end: '12:45', dateIndex: 4 }, // 5일차(인덱스4) 마드리드 아토차역 도착
        isFixed: true
      },
      // 마드리드 일정 및 장소들
      {
        id: 'mad-prado',
        name: '프라도 미술관 (마드리드)',
        category: 'Sightseeing',
        location: { lat: 40.4138, lng: -3.6921, address: 'C. de Ruiz de Alarcón, 23, Retiro, 28014 Madrid', city: '마드리드', timezone: 'Europe/Madrid' },
        openingHours: { start: '10:00', end: '20:00' },
        duration: 180,
        isFixed: false
      },
      {
        id: 'mad-palace',
        name: '마드리드 왕궁',
        category: 'Sightseeing',
        location: { lat: 40.4180, lng: -3.7144, address: 'C. de Bailén, Palacio, 28071 Madrid', city: '마드리드', timezone: 'Europe/Madrid' },
        openingHours: { start: '10:00', end: '18:00' },
        duration: 120,
        isFixed: false
      },
      {
        id: 'mad-cafe-gines',
        name: '산 히네스 (츄러스 카페)',
        category: 'Cafe',
        location: { lat: 40.4168, lng: -3.7073, address: 'Pasadizo de San Ginés, 5, Centro, 28013 Madrid', city: '마드리드', timezone: 'Europe/Madrid' },
        openingHours: { start: '08:00', end: '23:30' },
        duration: 60,
        isFixed: false
      },
      {
        id: 'mad-tour-toledo',
        name: '근교 톨레도 전일 가이드 투어',
        category: 'Activity',
        location: { lat: 39.8628, lng: -4.0273, address: '45001 Toledo, Spain', city: '마드리드', timezone: 'Europe/Madrid' },
        openingHours: { start: '08:00', end: '18:00' },
        duration: 480, // 8시간 전일 투어
        reservationTime: { start: '09:00', end: '17:00', dateIndex: 5 }, // 6일차(인덱스5) 전일 톨레도 투어
        isFixed: true
      }
    ]
  }
};
