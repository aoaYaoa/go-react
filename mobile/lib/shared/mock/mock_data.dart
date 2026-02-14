/// Mock 数据提供者
///
/// 为所有 UI 页面提供静态 Mock 数据，用于开发阶段的界面验证。
/// 后续阶段将替换为真实 API 调用。
library;

import 'dart:math';

// ============================================================
// 枚举定义
// ============================================================

/// 航班状态
enum FlightStatus {
  scheduled, // 计划中
  boarding, // 登机中
  departed, // 已起飞
  enRoute, // 飞行中
  landed, // 已降落
  arrived, // 已到达
  delayed, // 延误
  cancelled, // 取消
}

/// 无人机状态
enum DroneStatus {
  idle, // 空闲
  flying, // 飞行中
  maintenance, // 维护中
  offline, // 离线
  charging, // 充电中
  returning, // 返航中
}

/// 无人机类别
enum DroneCategory {
  commercial, // 商用
  industrial, // 工业
  agricultural, // 农业
  photography, // 航拍
  delivery, // 物流配送
  rescue, // 应急救援
}

/// 任务状态
enum MissionStatus {
  pending, // 待执行
  inProgress, // 执行中
  completed, // 已完成
  failed, // 失败
  cancelled, // 已取消
  paused, // 暂停
}

/// 任务类型
enum MissionType {
  inspection, // 巡检
  mapping, // 测绘
  delivery, // 配送
  surveillance, // 监控
  agriculture, // 农业植保
  rescue, // 搜救
  photography, // 航拍
}

/// 通知类型
enum NotificationType {
  flightDeparture, // 航班起飞
  flightArrival, // 航班到达
  flightDelay, // 航班延误
  flightGateChange, // 登机口变更
  flightCancelled, // 航班取消
  droneLowBattery, // 无人机低电量
  droneNoFlyZoneWarning, // 禁飞区预警
  droneEmergency, // 无人机紧急情况
  missionStarted, // 任务开始
  missionCompleted, // 任务完成
  systemMessage, // 系统消息
}

// ============================================================
// 数据模型
// ============================================================

/// 航空公司
class Airline {
  final String id;
  final String name;
  final String iataCode;
  final String country;

  const Airline({
    required this.id,
    required this.name,
    required this.iataCode,
    required this.country,
  });
}

/// 飞机
class Aircraft {
  final String id;
  final String model;
  final String manufacturer;
  final String registration;
  final int capacity;
  final int cruiseSpeed;

  const Aircraft({
    required this.id,
    required this.model,
    required this.manufacturer,
    required this.registration,
    required this.capacity,
    required this.cruiseSpeed,
  });
}

/// 航班
class Flight {
  final String id;
  final String flightNumber;
  final String departureAirport;
  final String arrivalAirport;
  final String departureCity;
  final String arrivalCity;
  final DateTime? scheduledDeparture;
  final DateTime? scheduledArrival;
  final DateTime? actualDeparture;
  final DateTime? actualArrival;
  final FlightStatus status;
  final Airline? airline;
  final Aircraft? aircraft;
  final String? gate;
  final String? terminal;
  final int delayMinutes;

  const Flight({
    required this.id,
    required this.flightNumber,
    required this.departureAirport,
    required this.arrivalAirport,
    required this.departureCity,
    required this.arrivalCity,
    this.scheduledDeparture,
    this.scheduledArrival,
    this.actualDeparture,
    this.actualArrival,
    required this.status,
    this.airline,
    this.aircraft,
    this.gate,
    this.terminal,
    this.delayMinutes = 0,
  });
}

/// 机场
class Airport {
  final String id;
  final String code;
  final String name;
  final String city;
  final String country;
  final double latitude;
  final double longitude;
  final double altitude;
  final String timezone;
  final int terminalCount;
  final int runwayCount;

  const Airport({
    required this.id,
    required this.code,
    required this.name,
    required this.city,
    required this.country,
    required this.latitude,
    required this.longitude,
    this.altitude = 0,
    required this.timezone,
    this.terminalCount = 1,
    this.runwayCount = 2,
  });
}

/// 机场天气
class AirportWeather {
  final String airportCode;
  final double temperature;
  final double humidity;
  final double windSpeed;
  final String windDirection;
  final String condition;
  final double visibility;
  final DateTime updatedAt;

  const AirportWeather({
    required this.airportCode,
    required this.temperature,
    required this.humidity,
    required this.windSpeed,
    required this.windDirection,
    required this.condition,
    required this.visibility,
    required this.updatedAt,
  });
}

/// 机场设施
class AirportFacility {
  final String id;
  final String airportCode;
  final String name;
  final String category;
  final String terminal;
  final String floor;
  final String description;

  const AirportFacility({
    required this.id,
    required this.airportCode,
    required this.name,
    required this.category,
    required this.terminal,
    required this.floor,
    required this.description,
  });
}

/// 无人机
class Drone {
  final String id;
  final String serialNumber;
  final String name;
  final String model;
  final String manufacturer;
  final DroneCategory category;
  final DroneStatus status;
  final int batteryLevel;
  final double? latitude;
  final double? longitude;
  final int? altitude;
  final int? speed;
  final String? cameraModel;
  final double maxAltitude;
  final double maxSpeed;
  final int batteryLife;

  const Drone({
    required this.id,
    required this.serialNumber,
    required this.name,
    required this.model,
    required this.manufacturer,
    required this.category,
    required this.status,
    required this.batteryLevel,
    this.latitude,
    this.longitude,
    this.altitude,
    this.speed,
    this.cameraModel,
    required this.maxAltitude,
    required this.maxSpeed,
    required this.batteryLife,
  });
}

/// 无人机任务
class DroneMission {
  final String id;
  final String droneId;
  final String droneName;
  final String missionName;
  final MissionType missionType;
  final MissionStatus status;
  final DateTime plannedStartTime;
  final DateTime plannedEndTime;
  final int progress;
  final String area;

  const DroneMission({
    required this.id,
    required this.droneId,
    required this.droneName,
    required this.missionName,
    required this.missionType,
    required this.status,
    required this.plannedStartTime,
    required this.plannedEndTime,
    this.progress = 0,
    required this.area,
  });
}

/// 用户
class MockUser {
  final String id;
  final String username;
  final String email;
  final String? avatar;
  final String? phone;
  final int totalFlights;
  final int totalDistance;
  final int airportsVisited;
  final int aircraftTypes;

  const MockUser({
    required this.id,
    required this.username,
    required this.email,
    this.avatar,
    this.phone,
    this.totalFlights = 0,
    this.totalDistance = 0,
    this.airportsVisited = 0,
    this.aircraftTypes = 0,
  });
}

/// 通知
class MockNotification {
  final String id;
  final NotificationType type;
  final String title;
  final String body;
  final DateTime receivedAt;
  final bool isRead;
  final String? relatedId;

  const MockNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.receivedAt,
    this.isRead = false,
    this.relatedId,
  });
}

/// 飞行记录
class FlightRecord {
  final String id;
  final String flightNumber;
  final String departureCity;
  final String arrivalCity;
  final DateTime date;
  final String? seatNumber;
  final String? aircraftModel;
  final int distance;
  final String? note;

  const FlightRecord({
    required this.id,
    required this.flightNumber,
    required this.departureCity,
    required this.arrivalCity,
    required this.date,
    this.seatNumber,
    this.aircraftModel,
    required this.distance,
    this.note,
  });
}

/// 成就
class Achievement {
  final String id;
  final String name;
  final String description;
  final String icon;
  final bool unlocked;
  final int currentValue;
  final int targetValue;
  final DateTime? unlockedAt;

  const Achievement({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    this.unlocked = false,
    required this.currentValue,
    required this.targetValue,
    this.unlockedAt,
  });
}

// ============================================================
// Mock 数据提供者
// ============================================================

class MockDataProvider {
  MockDataProvider._();

  static final _random = Random();

  /// 模拟网络延迟
  static Future<T> simulateDelay<T>(T data, {int minMs = 200, int maxMs = 800}) async {
    final delay = minMs + _random.nextInt(maxMs - minMs);
    await Future.delayed(Duration(milliseconds: delay));
    return data;
  }

  // ----------------------------------------------------------
  // 航空公司
  // ----------------------------------------------------------

  static const List<Airline> airlines = [
    Airline(id: 'al-001', name: '中国国际航空', iataCode: 'CA', country: '中国'),
    Airline(id: 'al-002', name: '中国东方航空', iataCode: 'MU', country: '中国'),
    Airline(id: 'al-003', name: '中国南方航空', iataCode: 'CZ', country: '中国'),
    Airline(id: 'al-004', name: '海南航空', iataCode: 'HU', country: '中国'),
    Airline(id: 'al-005', name: '深圳航空', iataCode: 'ZH', country: '中国'),
    Airline(id: 'al-006', name: '厦门航空', iataCode: 'MF', country: '中国'),
    Airline(id: 'al-007', name: '四川航空', iataCode: '3U', country: '中国'),
    Airline(id: 'al-008', name: '山东航空', iataCode: 'SC', country: '中国'),
    Airline(id: 'al-009', name: '春秋航空', iataCode: '9C', country: '中国'),
    Airline(id: 'al-010', name: '吉祥航空', iataCode: 'HO', country: '中国'),
  ];

  // ----------------------------------------------------------
  // 飞机
  // ----------------------------------------------------------

  static const List<Aircraft> aircrafts = [
    Aircraft(id: 'ac-001', model: 'Boeing 737-800', manufacturer: 'Boeing', registration: 'B-1234', capacity: 189, cruiseSpeed: 842),
    Aircraft(id: 'ac-002', model: 'Airbus A320-200', manufacturer: 'Airbus', registration: 'B-2345', capacity: 180, cruiseSpeed: 840),
    Aircraft(id: 'ac-003', model: 'Boeing 787-9', manufacturer: 'Boeing', registration: 'B-3456', capacity: 290, cruiseSpeed: 903),
    Aircraft(id: 'ac-004', model: 'Airbus A330-300', manufacturer: 'Airbus', registration: 'B-4567', capacity: 300, cruiseSpeed: 871),
    Aircraft(id: 'ac-005', model: 'Boeing 777-300ER', manufacturer: 'Boeing', registration: 'B-5678', capacity: 396, cruiseSpeed: 905),
    Aircraft(id: 'ac-006', model: 'Airbus A350-900', manufacturer: 'Airbus', registration: 'B-6789', capacity: 325, cruiseSpeed: 903),
    Aircraft(id: 'ac-007', model: 'COMAC C919', manufacturer: 'COMAC', registration: 'B-2468', capacity: 168, cruiseSpeed: 834),
    Aircraft(id: 'ac-008', model: 'Airbus A321neo', manufacturer: 'Airbus', registration: 'B-8901', capacity: 220, cruiseSpeed: 840),
  ];

  // ----------------------------------------------------------
  // 机场
  // ----------------------------------------------------------

  static const List<Airport> airports = [
    Airport(id: 'ap-001', code: 'PEK', name: '北京首都国际机场', city: '北京', country: '中国', latitude: 40.0799, longitude: 116.6031, altitude: 35, timezone: 'Asia/Shanghai', terminalCount: 3, runwayCount: 3),
    Airport(id: 'ap-002', code: 'PKX', name: '北京大兴国际机场', city: '北京', country: '中国', latitude: 39.5098, longitude: 116.4105, altitude: 30, timezone: 'Asia/Shanghai', terminalCount: 1, runwayCount: 4),
    Airport(id: 'ap-003', code: 'PVG', name: '上海浦东国际机场', city: '上海', country: '中国', latitude: 31.1443, longitude: 121.8083, altitude: 4, timezone: 'Asia/Shanghai', terminalCount: 2, runwayCount: 5),
    Airport(id: 'ap-004', code: 'SHA', name: '上海虹桥国际机场', city: '上海', country: '中国', latitude: 31.1979, longitude: 121.3363, altitude: 3, timezone: 'Asia/Shanghai', terminalCount: 2, runwayCount: 2),
    Airport(id: 'ap-005', code: 'CAN', name: '广州白云国际机场', city: '广州', country: '中国', latitude: 23.3924, longitude: 113.2988, altitude: 15, timezone: 'Asia/Shanghai', terminalCount: 2, runwayCount: 3),
    Airport(id: 'ap-006', code: 'SZX', name: '深圳宝安国际机场', city: '深圳', country: '中国', latitude: 22.6393, longitude: 113.8107, altitude: 4, timezone: 'Asia/Shanghai', terminalCount: 2, runwayCount: 2),
    Airport(id: 'ap-007', code: 'CTU', name: '成都天府国际机场', city: '成都', country: '中国', latitude: 30.3197, longitude: 104.4412, altitude: 450, timezone: 'Asia/Shanghai', terminalCount: 2, runwayCount: 3),
    Airport(id: 'ap-008', code: 'CKG', name: '重庆江北国际机场', city: '重庆', country: '中国', latitude: 29.7192, longitude: 106.6417, altitude: 416, timezone: 'Asia/Shanghai', terminalCount: 3, runwayCount: 3),
    Airport(id: 'ap-009', code: 'HGH', name: '杭州萧山国际机场', city: '杭州', country: '中国', latitude: 30.2295, longitude: 120.4344, altitude: 7, timezone: 'Asia/Shanghai', terminalCount: 3, runwayCount: 2),
    Airport(id: 'ap-010', code: 'WUH', name: '武汉天河国际机场', city: '武汉', country: '中国', latitude: 30.7838, longitude: 114.2081, altitude: 34, timezone: 'Asia/Shanghai', terminalCount: 3, runwayCount: 2),
    Airport(id: 'ap-011', code: 'XIY', name: '西安咸阳国际机场', city: '西安', country: '中国', latitude: 34.4471, longitude: 108.7516, altitude: 479, timezone: 'Asia/Shanghai', terminalCount: 3, runwayCount: 2),
    Airport(id: 'ap-012', code: 'HAK', name: '海口美兰国际机场', city: '海口', country: '中国', latitude: 19.9349, longitude: 110.4590, altitude: 23, timezone: 'Asia/Shanghai', terminalCount: 2, runwayCount: 2),
  ];

  // ----------------------------------------------------------
  // 航班
  // ----------------------------------------------------------

  static List<Flight> getMockFlights() {
    final now = DateTime.now();
    return [
      Flight(
        id: 'fl-001', flightNumber: 'CA1301',
        departureAirport: 'PEK', arrivalAirport: 'PVG',
        departureCity: '北京', arrivalCity: '上海',
        scheduledDeparture: now.add(const Duration(hours: 2)),
        scheduledArrival: now.add(const Duration(hours: 4, minutes: 30)),
        status: FlightStatus.scheduled,
        airline: airlines[0], aircraft: aircrafts[0],
        gate: 'A12', terminal: 'T3',
      ),
      Flight(
        id: 'fl-002', flightNumber: 'MU5101',
        departureAirport: 'PVG', arrivalAirport: 'CAN',
        departureCity: '上海', arrivalCity: '广州',
        scheduledDeparture: now.add(const Duration(hours: 1)),
        scheduledArrival: now.add(const Duration(hours: 3, minutes: 45)),
        status: FlightStatus.boarding,
        airline: airlines[1], aircraft: aircrafts[1],
        gate: 'C15', terminal: 'T1',
      ),
      Flight(
        id: 'fl-003', flightNumber: 'CZ3456',
        departureAirport: 'CAN', arrivalAirport: 'CTU',
        departureCity: '广州', arrivalCity: '成都',
        scheduledDeparture: now.subtract(const Duration(hours: 1)),
        scheduledArrival: now.add(const Duration(hours: 1, minutes: 30)),
        actualDeparture: now.subtract(const Duration(minutes: 55)),
        status: FlightStatus.enRoute,
        airline: airlines[2], aircraft: aircrafts[3],
        gate: 'B22', terminal: 'T2',
      ),
      Flight(
        id: 'fl-004', flightNumber: 'HU7890',
        departureAirport: 'HAK', arrivalAirport: 'PEK',
        departureCity: '海口', arrivalCity: '北京',
        scheduledDeparture: now.add(const Duration(hours: 6)),
        scheduledArrival: now.add(const Duration(hours: 10)),
        status: FlightStatus.scheduled,
        airline: airlines[3], aircraft: aircrafts[6],
        gate: 'A01', terminal: 'T1',
      ),
      Flight(
        id: 'fl-005', flightNumber: 'ZH9101',
        departureAirport: 'SZX', arrivalAirport: 'PVG',
        departureCity: '深圳', arrivalCity: '上海',
        scheduledDeparture: now.subtract(const Duration(hours: 2)),
        scheduledArrival: now.add(const Duration(minutes: 40)),
        actualDeparture: now.subtract(const Duration(hours: 1, minutes: 50)),
        status: FlightStatus.enRoute,
        airline: airlines[4], aircraft: aircrafts[7],
        gate: 'B05', terminal: 'T3',
      ),
      Flight(
        id: 'fl-006', flightNumber: 'MF8101',
        departureAirport: 'PVG', arrivalAirport: 'HGH',
        departureCity: '上海', arrivalCity: '杭州',
        scheduledDeparture: now.add(const Duration(hours: 3)),
        scheduledArrival: now.add(const Duration(hours: 4, minutes: 10)),
        status: FlightStatus.delayed, delayMinutes: 45,
        airline: airlines[5], aircraft: aircrafts[1],
        gate: 'A10', terminal: 'T2',
      ),
      Flight(
        id: 'fl-007', flightNumber: '3U8801',
        departureAirport: 'CTU', arrivalAirport: 'PVG',
        departureCity: '成都', arrivalCity: '上海',
        scheduledDeparture: now.subtract(const Duration(hours: 3)),
        scheduledArrival: now.subtract(const Duration(minutes: 10)),
        actualDeparture: now.subtract(const Duration(hours: 2, minutes: 55)),
        actualArrival: now.subtract(const Duration(minutes: 5)),
        status: FlightStatus.arrived,
        airline: airlines[6], aircraft: aircrafts[2],
        gate: 'C02', terminal: 'T1',
      ),
      Flight(
        id: 'fl-008', flightNumber: 'CA1501',
        departureAirport: 'PEK', arrivalAirport: 'CTU',
        departureCity: '北京', arrivalCity: '成都',
        scheduledDeparture: now.add(const Duration(hours: 5)),
        scheduledArrival: now.add(const Duration(hours: 8)),
        status: FlightStatus.cancelled,
        airline: airlines[0], aircraft: aircrafts[4],
        gate: 'A20', terminal: 'T3',
      ),
      Flight(
        id: 'fl-009', flightNumber: 'MU2101',
        departureAirport: 'PVG', arrivalAirport: 'XIY',
        departureCity: '上海', arrivalCity: '西安',
        scheduledDeparture: now.add(const Duration(minutes: 30)),
        scheduledArrival: now.add(const Duration(hours: 3)),
        status: FlightStatus.boarding,
        airline: airlines[1], aircraft: aircrafts[5],
        gate: 'C08', terminal: 'T1',
      ),
      Flight(
        id: 'fl-010', flightNumber: 'CZ6101',
        departureAirport: 'CAN', arrivalAirport: 'CKG',
        departureCity: '广州', arrivalCity: '重庆',
        scheduledDeparture: now.subtract(const Duration(hours: 4)),
        scheduledArrival: now.subtract(const Duration(hours: 1, minutes: 40)),
        actualDeparture: now.subtract(const Duration(hours: 3, minutes: 50)),
        actualArrival: now.subtract(const Duration(hours: 1, minutes: 35)),
        status: FlightStatus.arrived,
        airline: airlines[2], aircraft: aircrafts[0],
        gate: 'B15', terminal: 'T2',
      ),
      Flight(
        id: 'fl-011', flightNumber: 'SC4601',
        departureAirport: 'WUH', arrivalAirport: 'CAN',
        departureCity: '武汉', arrivalCity: '广州',
        scheduledDeparture: now.subtract(const Duration(hours: 1, minutes: 30)),
        scheduledArrival: now.add(const Duration(minutes: 20)),
        actualDeparture: now.subtract(const Duration(hours: 1, minutes: 25)),
        status: FlightStatus.departed,
        airline: airlines[7], aircraft: aircrafts[1],
        gate: 'A05', terminal: 'T1',
      ),
      Flight(
        id: 'fl-012', flightNumber: '9C8801',
        departureAirport: 'PVG', arrivalAirport: 'WUH',
        departureCity: '上海', arrivalCity: '武汉',
        scheduledDeparture: now.add(const Duration(hours: 4)),
        scheduledArrival: now.add(const Duration(hours: 5, minutes: 50)),
        status: FlightStatus.scheduled,
        airline: airlines[8], aircraft: aircrafts[0],
        gate: 'B12', terminal: 'T2',
      ),
    ];
  }

  // ----------------------------------------------------------
  // 机场天气
  // ----------------------------------------------------------

  static List<AirportWeather> getMockWeather() {
    final now = DateTime.now();
    return [
      AirportWeather(airportCode: 'PEK', temperature: 28.5, humidity: 55, windSpeed: 12, windDirection: '西南', condition: '晴', visibility: 10.0, updatedAt: now),
      AirportWeather(airportCode: 'PVG', temperature: 32.0, humidity: 72, windSpeed: 8, windDirection: '东南', condition: '多云', visibility: 8.0, updatedAt: now),
      AirportWeather(airportCode: 'CAN', temperature: 35.2, humidity: 80, windSpeed: 5, windDirection: '南', condition: '雷阵雨', visibility: 5.0, updatedAt: now),
      AirportWeather(airportCode: 'CTU', temperature: 26.8, humidity: 65, windSpeed: 3, windDirection: '北', condition: '阴', visibility: 7.0, updatedAt: now),
      AirportWeather(airportCode: 'SZX', temperature: 33.5, humidity: 78, windSpeed: 10, windDirection: '东', condition: '多云', visibility: 9.0, updatedAt: now),
      AirportWeather(airportCode: 'HGH', temperature: 30.0, humidity: 68, windSpeed: 6, windDirection: '西', condition: '晴', visibility: 10.0, updatedAt: now),
      AirportWeather(airportCode: 'HAK', temperature: 34.0, humidity: 85, windSpeed: 15, windDirection: '东南', condition: '阵雨', visibility: 6.0, updatedAt: now),
      AirportWeather(airportCode: 'WUH', temperature: 36.5, humidity: 70, windSpeed: 4, windDirection: '南', condition: '晴', visibility: 10.0, updatedAt: now),
    ];
  }

  // ----------------------------------------------------------
  // 机场设施
  // ----------------------------------------------------------

  static const List<AirportFacility> facilities = [
    AirportFacility(id: 'fac-001', airportCode: 'PEK', name: '星巴克', category: '餐饮', terminal: 'T3', floor: 'F3', description: '国际出发区域，提供咖啡和轻食'),
    AirportFacility(id: 'fac-002', airportCode: 'PEK', name: '全聚德', category: '餐饮', terminal: 'T3', floor: 'F3', description: '北京烤鸭，中式正餐'),
    AirportFacility(id: 'fac-003', airportCode: 'PEK', name: '日上免税店', category: '购物', terminal: 'T3', floor: 'F3', description: '国际出发免税购物'),
    AirportFacility(id: 'fac-004', airportCode: 'PEK', name: '国航贵宾休息室', category: '休息室', terminal: 'T3', floor: 'F3', description: '国航金卡及以上会员专享'),
    AirportFacility(id: 'fac-005', airportCode: 'PVG', name: '麦当劳', category: '餐饮', terminal: 'T1', floor: 'F2', description: '快餐，24小时营业'),
    AirportFacility(id: 'fac-006', airportCode: 'PVG', name: '中免集团免税店', category: '购物', terminal: 'T2', floor: 'F3', description: '国际出发免税购物'),
    AirportFacility(id: 'fac-007', airportCode: 'PVG', name: '东航贵宾休息室', category: '休息室', terminal: 'T1', floor: 'F3', description: '东航白金卡及以上会员专享'),
    AirportFacility(id: 'fac-008', airportCode: 'CAN', name: '广州酒家', category: '餐饮', terminal: 'T2', floor: 'F3', description: '粤式早茶和正餐'),
  ];

  // ----------------------------------------------------------
  // 无人机
  // ----------------------------------------------------------

  static List<Drone> getMockDrones() {
    return const [
      Drone(
        id: 'dr-001', serialNumber: 'DJI-M300-001', name: '经纬 M300 RTK #1',
        model: 'Matrice 300 RTK', manufacturer: 'DJI',
        category: DroneCategory.industrial, status: DroneStatus.idle,
        batteryLevel: 92, latitude: 40.0799, longitude: 116.6031, altitude: 0,
        cameraModel: 'H20T', maxAltitude: 7000, maxSpeed: 23, batteryLife: 55,
      ),
      Drone(
        id: 'dr-002', serialNumber: 'DJI-M300-002', name: '经纬 M300 RTK #2',
        model: 'Matrice 300 RTK', manufacturer: 'DJI',
        category: DroneCategory.industrial, status: DroneStatus.flying,
        batteryLevel: 67, latitude: 31.2345, longitude: 121.4567, altitude: 120, speed: 15,
        cameraModel: 'H20T', maxAltitude: 7000, maxSpeed: 23, batteryLife: 55,
      ),
      Drone(
        id: 'dr-003', serialNumber: 'DJI-MAV3-001', name: 'Mavic 3 Enterprise #1',
        model: 'Mavic 3 Enterprise', manufacturer: 'DJI',
        category: DroneCategory.photography, status: DroneStatus.idle,
        batteryLevel: 100, latitude: 23.1291, longitude: 113.2644, altitude: 0,
        cameraModel: 'Hasselblad', maxAltitude: 6000, maxSpeed: 21, batteryLife: 46,
      ),
      Drone(
        id: 'dr-004', serialNumber: 'DJI-MAV3-002', name: 'Mavic 3 Enterprise #2',
        model: 'Mavic 3 Enterprise', manufacturer: 'DJI',
        category: DroneCategory.photography, status: DroneStatus.flying,
        batteryLevel: 45, latitude: 30.5728, longitude: 104.0668, altitude: 85, speed: 12,
        cameraModel: 'Hasselblad', maxAltitude: 6000, maxSpeed: 21, batteryLife: 46,
      ),
      Drone(
        id: 'dr-005', serialNumber: 'DJI-M30-001', name: '经纬 M30 #1',
        model: 'Matrice 30', manufacturer: 'DJI',
        category: DroneCategory.commercial, status: DroneStatus.maintenance,
        batteryLevel: 30, latitude: 22.5431, longitude: 114.0579, altitude: 0,
        cameraModel: 'M30T', maxAltitude: 7000, maxSpeed: 23, batteryLife: 41,
      ),
      Drone(
        id: 'dr-006', serialNumber: 'DJI-AGR-001', name: 'T40 植保机 #1',
        model: 'Agras T40', manufacturer: 'DJI',
        category: DroneCategory.agricultural, status: DroneStatus.idle,
        batteryLevel: 88, latitude: 30.5785, longitude: 103.9471, altitude: 0,
        cameraModel: 'FPV', maxAltitude: 30, maxSpeed: 10, batteryLife: 18,
      ),
      Drone(
        id: 'dr-007', serialNumber: 'AUTEL-EVO2-001', name: 'EVO II Pro #1',
        model: 'EVO II Pro V3', manufacturer: 'Autel',
        category: DroneCategory.photography, status: DroneStatus.charging,
        batteryLevel: 15, latitude: 39.9042, longitude: 116.4074, altitude: 0,
        cameraModel: '1-inch CMOS', maxAltitude: 7200, maxSpeed: 20, batteryLife: 42,
      ),
      Drone(
        id: 'dr-008', serialNumber: 'DJI-MINI4-001', name: 'Mini 4 Pro #1',
        model: 'Mini 4 Pro', manufacturer: 'DJI',
        category: DroneCategory.photography, status: DroneStatus.flying,
        batteryLevel: 58, latitude: 31.2304, longitude: 121.4737, altitude: 50, speed: 8,
        cameraModel: '1/1.3-inch CMOS', maxAltitude: 4000, maxSpeed: 16, batteryLife: 34,
      ),
    ];
  }

  // ----------------------------------------------------------
  // 无人机任务
  // ----------------------------------------------------------

  static List<DroneMission> getMockMissions() {
    final now = DateTime.now();
    return [
      DroneMission(
        id: 'ms-001', droneId: 'dr-002', droneName: '经纬 M300 RTK #2',
        missionName: '浦东新区电力线路巡检',
        missionType: MissionType.inspection, status: MissionStatus.inProgress,
        plannedStartTime: now.subtract(const Duration(hours: 1)),
        plannedEndTime: now.add(const Duration(hours: 1)),
        progress: 62, area: '上海市浦东新区',
      ),
      DroneMission(
        id: 'ms-002', droneId: 'dr-004', droneName: 'Mavic 3 Enterprise #2',
        missionName: '天府新区地形测绘',
        missionType: MissionType.mapping, status: MissionStatus.inProgress,
        plannedStartTime: now.subtract(const Duration(minutes: 30)),
        plannedEndTime: now.add(const Duration(hours: 2)),
        progress: 25, area: '成都市天府新区',
      ),
      DroneMission(
        id: 'ms-003', droneId: 'dr-008', droneName: 'Mini 4 Pro #1',
        missionName: '外滩景区航拍',
        missionType: MissionType.photography, status: MissionStatus.inProgress,
        plannedStartTime: now.subtract(const Duration(minutes: 15)),
        plannedEndTime: now.add(const Duration(minutes: 45)),
        progress: 40, area: '上海市黄浦区',
      ),
      DroneMission(
        id: 'ms-004', droneId: 'dr-001', droneName: '经纬 M300 RTK #1',
        missionName: '首都机场周边安全巡查',
        missionType: MissionType.surveillance, status: MissionStatus.pending,
        plannedStartTime: now.add(const Duration(hours: 2)),
        plannedEndTime: now.add(const Duration(hours: 4)),
        progress: 0, area: '北京市顺义区',
      ),
      DroneMission(
        id: 'ms-005', droneId: 'dr-006', droneName: 'T40 植保机 #1',
        missionName: '崇州水稻田植保作业',
        missionType: MissionType.agriculture, status: MissionStatus.pending,
        plannedStartTime: now.add(const Duration(hours: 5)),
        plannedEndTime: now.add(const Duration(hours: 8)),
        progress: 0, area: '成都市崇州市',
      ),
      DroneMission(
        id: 'ms-006', droneId: 'dr-003', droneName: 'Mavic 3 Enterprise #1',
        missionName: '白云山景区航拍',
        missionType: MissionType.photography, status: MissionStatus.completed,
        plannedStartTime: now.subtract(const Duration(hours: 5)),
        plannedEndTime: now.subtract(const Duration(hours: 3)),
        progress: 100, area: '广州市白云区',
      ),
      DroneMission(
        id: 'ms-007', droneId: 'dr-005', droneName: '经纬 M30 #1',
        missionName: '深圳湾大桥结构检测',
        missionType: MissionType.inspection, status: MissionStatus.failed,
        plannedStartTime: now.subtract(const Duration(hours: 6)),
        plannedEndTime: now.subtract(const Duration(hours: 4)),
        progress: 35, area: '深圳市南山区',
      ),
      DroneMission(
        id: 'ms-008', droneId: 'dr-001', droneName: '经纬 M300 RTK #1',
        missionName: '顺义区物流配送测试',
        missionType: MissionType.delivery, status: MissionStatus.cancelled,
        plannedStartTime: now.subtract(const Duration(hours: 3)),
        plannedEndTime: now.subtract(const Duration(hours: 2)),
        progress: 0, area: '北京市顺义区',
      ),
    ];
  }

  // ----------------------------------------------------------
  // 用户
  // ----------------------------------------------------------

  static const List<MockUser> users = [
    MockUser(
      id: 'u-001', username: '张明', email: 'zhangming@example.com',
      phone: '13800138001', totalFlights: 42, totalDistance: 68500,
      airportsVisited: 18, aircraftTypes: 6,
    ),
    MockUser(
      id: 'u-002', username: '李华', email: 'lihua@example.com',
      phone: '13900139002', totalFlights: 15, totalDistance: 22000,
      airportsVisited: 8, aircraftTypes: 3,
    ),
    MockUser(
      id: 'u-003', username: '王芳', email: 'wangfang@example.com',
      phone: '13700137003', totalFlights: 78, totalDistance: 125000,
      airportsVisited: 35, aircraftTypes: 10,
    ),
    MockUser(
      id: 'u-004', username: '赵强', email: 'zhaoqiang@example.com',
      phone: '13600136004', totalFlights: 5, totalDistance: 8200,
      airportsVisited: 4, aircraftTypes: 2,
    ),
    MockUser(
      id: 'u-005', username: '陈静', email: 'chenjing@example.com',
      phone: '13500135005', totalFlights: 120, totalDistance: 210000,
      airportsVisited: 52, aircraftTypes: 12,
    ),
  ];

  /// 获取当前登录用户（默认第一个）
  static MockUser getCurrentUser() => users[0];

  // ----------------------------------------------------------
  // 通知
  // ----------------------------------------------------------

  static List<MockNotification> getMockNotifications() {
    final now = DateTime.now();
    return [
      MockNotification(
        id: 'n-001', type: NotificationType.flightDelay,
        title: '航班延误通知', body: '您关注的航班 MF8101 预计延误45分钟，新的起飞时间为 ${_formatTime(now.add(const Duration(hours: 3, minutes: 45)))}',
        receivedAt: now.subtract(const Duration(minutes: 15)),
        relatedId: 'fl-006',
      ),
      MockNotification(
        id: 'n-002', type: NotificationType.flightDeparture,
        title: '航班起飞提醒', body: '您关注的航班 CA1301 将于2小时后起飞，请提前到达机场',
        receivedAt: now.subtract(const Duration(minutes: 30)),
        relatedId: 'fl-001',
      ),
      MockNotification(
        id: 'n-003', type: NotificationType.flightGateChange,
        title: '登机口变更', body: '航班 MU5101 登机口已变更为 C18（原 C15），请注意',
        receivedAt: now.subtract(const Duration(hours: 1)),
        isRead: true, relatedId: 'fl-002',
      ),
      MockNotification(
        id: 'n-004', type: NotificationType.flightCancelled,
        title: '航班取消通知', body: '很抱歉，航班 CA1501 已取消，请联系航空公司改签',
        receivedAt: now.subtract(const Duration(hours: 2)),
        relatedId: 'fl-008',
      ),
      MockNotification(
        id: 'n-005', type: NotificationType.droneLowBattery,
        title: '无人机低电量警告', body: 'EVO II Pro #1 电量仅剩 15%，请尽快充电',
        receivedAt: now.subtract(const Duration(hours: 1, minutes: 30)),
        relatedId: 'dr-007',
      ),
      MockNotification(
        id: 'n-006', type: NotificationType.missionCompleted,
        title: '任务完成', body: '白云山景区航拍任务已完成，共拍摄 128 张照片',
        receivedAt: now.subtract(const Duration(hours: 3)),
        isRead: true, relatedId: 'ms-006',
      ),
      MockNotification(
        id: 'n-007', type: NotificationType.droneEmergency,
        title: '无人机异常警告', body: '经纬 M30 #1 在深圳湾大桥巡检任务中信号异常，已自动返航',
        receivedAt: now.subtract(const Duration(hours: 5)),
        isRead: true, relatedId: 'dr-005',
      ),
      MockNotification(
        id: 'n-008', type: NotificationType.flightArrival,
        title: '航班到达通知', body: '您关注的航班 3U8801 已安全到达上海浦东国际机场',
        receivedAt: now.subtract(const Duration(minutes: 5)),
        relatedId: 'fl-007',
      ),
      MockNotification(
        id: 'n-009', type: NotificationType.systemMessage,
        title: '系统更新', body: 'SkyTracker 2.0 版本已发布，新增 AR 天空视图功能',
        receivedAt: now.subtract(const Duration(days: 1)),
        isRead: true,
      ),
      MockNotification(
        id: 'n-010', type: NotificationType.droneNoFlyZoneWarning,
        title: '禁飞区预警', body: 'Mini 4 Pro #1 距离外滩禁飞区边界不足 500 米，请注意',
        receivedAt: now.subtract(const Duration(minutes: 10)),
        relatedId: 'dr-008',
      ),
    ];
  }

  static String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }

  // ----------------------------------------------------------
  // 飞行记录
  // ----------------------------------------------------------

  static List<FlightRecord> getMockFlightRecords() {
    return [
      FlightRecord(id: 'fr-001', flightNumber: 'CA1301', departureCity: '北京', arrivalCity: '上海', date: DateTime(2024, 12, 15), seatNumber: '32A', aircraftModel: 'Boeing 737-800', distance: 1075, note: '商务出差'),
      FlightRecord(id: 'fr-002', flightNumber: 'MU5101', departureCity: '上海', arrivalCity: '广州', date: DateTime(2024, 12, 18), seatNumber: '15F', aircraftModel: 'Airbus A320-200', distance: 1213, note: '客户拜访'),
      FlightRecord(id: 'fr-003', flightNumber: 'CZ3456', departureCity: '广州', arrivalCity: '成都', date: DateTime(2025, 1, 5), seatNumber: '8A', aircraftModel: 'Airbus A330-300', distance: 1235, note: '春节回家'),
      FlightRecord(id: 'fr-004', flightNumber: 'HU7890', departureCity: '海口', arrivalCity: '北京', date: DateTime(2025, 1, 20), seatNumber: '22C', aircraftModel: 'COMAC C919', distance: 2021, note: '度假返程'),
      FlightRecord(id: 'fr-005', flightNumber: '3U8801', departureCity: '成都', arrivalCity: '上海', date: DateTime(2025, 2, 10), seatNumber: '28D', aircraftModel: 'Boeing 787-9', distance: 1660, note: '技术交流'),
      FlightRecord(id: 'fr-006', flightNumber: 'ZH9101', departureCity: '深圳', arrivalCity: '上海', date: DateTime(2025, 3, 1), seatNumber: '10A', aircraftModel: 'Airbus A321neo', distance: 1210),
      FlightRecord(id: 'fr-007', flightNumber: 'MF8101', departureCity: '上海', arrivalCity: '杭州', date: DateTime(2025, 3, 15), seatNumber: '5F', aircraftModel: 'Airbus A320-200', distance: 165, note: '周末短途'),
      FlightRecord(id: 'fr-008', flightNumber: 'CA1501', departureCity: '北京', arrivalCity: '成都', date: DateTime(2025, 4, 2), seatNumber: '18A', aircraftModel: 'Boeing 777-300ER', distance: 1515, note: '项目验收'),
    ];
  }

  // ----------------------------------------------------------
  // 成就
  // ----------------------------------------------------------

  static List<Achievement> getMockAchievements() {
    final user = getCurrentUser();
    return [
      Achievement(id: 'ach-001', name: '初次飞行', description: '完成第一次飞行记录', icon: 'flight_takeoff', unlocked: true, currentValue: user.totalFlights, targetValue: 1, unlockedAt: DateTime(2024, 6, 15)),
      Achievement(id: 'ach-002', name: '飞行达人', description: '累计飞行 10 次', icon: 'airplanemode_active', unlocked: true, currentValue: user.totalFlights, targetValue: 10, unlockedAt: DateTime(2024, 9, 20)),
      Achievement(id: 'ach-003', name: '空中常客', description: '累计飞行 50 次', icon: 'stars', unlocked: false, currentValue: user.totalFlights, targetValue: 50),
      Achievement(id: 'ach-004', name: '万里行者', description: '累计飞行里程达到 10,000 公里', icon: 'public', unlocked: true, currentValue: user.totalDistance, targetValue: 10000, unlockedAt: DateTime(2024, 11, 5)),
      Achievement(id: 'ach-005', name: '环球旅行家', description: '累计飞行里程达到 100,000 公里', icon: 'language', unlocked: false, currentValue: user.totalDistance, targetValue: 100000),
      Achievement(id: 'ach-006', name: '机场探索者', description: '访问 10 个不同机场', icon: 'explore', unlocked: true, currentValue: user.airportsVisited, targetValue: 10, unlockedAt: DateTime(2025, 1, 10)),
      Achievement(id: 'ach-007', name: '机场收藏家', description: '访问 30 个不同机场', icon: 'collections', unlocked: false, currentValue: user.airportsVisited, targetValue: 30),
      Achievement(id: 'ach-008', name: '机型鉴赏家', description: '乘坐 5 种不同机型', icon: 'flight', unlocked: true, currentValue: user.aircraftTypes, targetValue: 5, unlockedAt: DateTime(2025, 2, 28)),
    ];
  }

  // ----------------------------------------------------------
  // 查询辅助方法
  // ----------------------------------------------------------

  /// 根据航班号模糊搜索航班
  static Future<List<Flight>> searchFlights(String query) async {
    final upperQuery = query.toUpperCase();
    final results = getMockFlights()
        .where((f) =>
            f.flightNumber.toUpperCase().contains(upperQuery) ||
            f.departureCity.contains(query) ||
            f.arrivalCity.contains(query) ||
            f.departureAirport.toUpperCase().contains(upperQuery) ||
            f.arrivalAirport.toUpperCase().contains(upperQuery))
        .toList();
    return simulateDelay(results);
  }

  /// 根据 ID 获取航班详情
  static Future<Flight?> getFlightById(String id) async {
    final flights = getMockFlights();
    try {
      final flight = flights.firstWhere((f) => f.id == id);
      return simulateDelay(flight);
    } catch (_) {
      return simulateDelay(null);
    }
  }

  /// 根据机场代码搜索机场
  static Future<List<Airport>> searchAirports(String query) async {
    final upperQuery = query.toUpperCase();
    final results = airports
        .where((a) =>
            a.code.toUpperCase().contains(upperQuery) ||
            a.name.contains(query) ||
            a.city.contains(query))
        .toList();
    return simulateDelay(results);
  }

  /// 根据机场代码获取天气
  static AirportWeather? getWeatherByAirport(String airportCode) {
    final weather = getMockWeather();
    try {
      return weather.firstWhere((w) => w.airportCode == airportCode);
    } catch (_) {
      return null;
    }
  }

  /// 根据机场代码获取设施列表
  static List<AirportFacility> getFacilitiesByAirport(String airportCode) {
    return facilities.where((f) => f.airportCode == airportCode).toList();
  }

  /// 根据机场代码获取出发/到达航班
  static List<Flight> getFlightsByAirport(String airportCode, {bool isDeparture = true}) {
    final flights = getMockFlights();
    if (isDeparture) {
      return flights.where((f) => f.departureAirport == airportCode).toList();
    }
    return flights.where((f) => f.arrivalAirport == airportCode).toList();
  }

  /// 获取关注的航班（模拟前3个航班为已关注）
  static List<Flight> getFollowedFlights() {
    return getMockFlights().take(3).toList();
  }

  /// 获取未读通知数量
  static int getUnreadNotificationCount() {
    return getMockNotifications().where((n) => !n.isRead).length;
  }

  /// 根据无人机 ID 获取任务列表
  static List<DroneMission> getMissionsByDrone(String droneId) {
    return getMockMissions().where((m) => m.droneId == droneId).toList();
  }

  /// 获取待执行和进行中的任务
  static List<DroneMission> getActiveMissions() {
    return getMockMissions()
        .where((m) => m.status == MissionStatus.pending || m.status == MissionStatus.inProgress)
        .toList();
  }
}
