import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token 存储（安全存储）
  Future<void> setToken(String token) async {
    await _secureStorage.write(key: 'token', value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'token');
  }

  Future<void> removeToken() async {
    await _secureStorage.delete(key: 'token');
  }

  // 用户信息存储
  Future<void> setUser(Map<String, dynamic> user) async {
    await _prefs?.setString('user', json.encode(user));
  }

  Future<Map<String, dynamic>?> getUser() async {
    final userStr = _prefs?.getString('user');
    if (userStr != null) {
      return json.decode(userStr);
    }
    return null;
  }

  Future<void> removeUser() async {
    await _prefs?.remove('user');
  }

  // 角色存储
  Future<void> setRoles(List<dynamic> roles) async {
    await _prefs?.setString('roles', json.encode(roles));
  }

  Future<List<dynamic>?> getRoles() async {
    final rolesStr = _prefs?.getString('roles');
    if (rolesStr != null) {
      return json.decode(rolesStr);
    }
    return null;
  }

  Future<void> removeRoles() async {
    await _prefs?.remove('roles');
  }

  // 菜单存储
  Future<void> setMenus(List<dynamic> menus) async {
    await _prefs?.setString('menus', json.encode(menus));
  }

  Future<List<dynamic>?> getMenus() async {
    final menusStr = _prefs?.getString('menus');
    if (menusStr != null) {
      return json.decode(menusStr);
    }
    return null;
  }

  Future<void> removeMenus() async {
    await _prefs?.remove('menus');
  }

  // 清除所有数据
  Future<void> clearAll() async {
    await removeToken();
    await removeUser();
    await removeRoles();
    await removeMenus();
  }
}
