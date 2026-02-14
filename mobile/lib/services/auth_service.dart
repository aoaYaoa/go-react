import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _api = ApiService();
  final StorageService _storage = StorageService();

  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
    required String captchaId,
    required String captchaCode,
  }) async {
    final result = await _api.post('/api/auth/login', {
      'username': username,
      'password': password,
      'captcha_id': captchaId,
      'captcha_code': captchaCode,
    });

    return result;
  }

  Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    String? email,
  }) async {
    return await _api.post('/api/auth/register', {
      'username': username,
      'password': password,
      'email': email,
    });
  }

  Future<Map<String, dynamic>> getCaptcha() async {
    return await _api.get('/api/auth/captcha');
  }

  Future<Map<String, dynamic>> getUserInfo() async {
    return await _api.get('/api/users/me');
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }
}
