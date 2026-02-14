# Go React Mobile

Flutter 移动端应用，与 Go + React 后端服务集成。

## 项目结构

```
mobile/
├── android/          # Android 平台代码
├── ios/              # iOS 平台代码
├── lib/              # Dart 源代码
│   ├── main.dart     # 应用入口
│   └── ...
├── test/             # 测试代码
├── pubspec.yaml      # 依赖配置
└── README.md         # 项目说明
```

## 环境要求

- Flutter SDK ^3.7.2
- Dart SDK ^3.7.2
- Android Studio / Xcode (用于模拟器)

## 快速开始

### 1. 安装依赖

```bash
cd mobile
flutter pub get
```

### 2. 运行应用

**iOS 模拟器:**
```bash
flutter run
```

**Android 模拟器:**
```bash
flutter run
```

**指定设备:**
```bash
# 列出可用设备
flutter devices

# 在指定设备上运行
flutter run -d <device_id>
```

### 3. 构建发布版本

**Android APK:**
```bash
flutter build apk
```

**Android App Bundle:**
```bash
flutter build appbundle
```

**iOS:**
```bash
flutter build ios
```

## 开发指南

### 代码规范

- 使用 `flutter analyze` 检查代码
- 使用 `flutter format lib/` 格式化代码

### 常用命令

```bash
# 热重载 (在运行状态下按 r)
# 热重启 (在运行状态下按 R)
# 查看所有命令 (在运行状态下按 h)

# 运行测试
flutter test

# 检查依赖更新
flutter pub outdated

# 升级依赖
flutter pub upgrade
```

## 后端 API 集成

后端服务运行在 `http://localhost:8080` (开发环境)

在 `lib/` 目录下创建 API 服务层来与后端通信：

```dart
// lib/services/api_service.dart
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:8080';
  
  // API 调用方法
}
```

## 技术栈

- **Flutter**: UI 框架
- **Dart**: 编程语言
- **Material Design**: UI 组件库

## 相关文档

- [Flutter 官方文档](https://docs.flutter.dev/)
- [Dart 语言文档](https://dart.dev/guides)
- [Material Design](https://m3.material.io/)

## 项目关联

- **后端**: `../backend/` (Go)
- **前端**: `../frontend/` (React)
