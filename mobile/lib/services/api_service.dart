import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

/// API 配置
class ApiConfig {
  /// 服务器地址
  static const String baseUrl = 'http://localhost:8080';

  /// 是否启用请求签名（需与后端 ENABLE_SIGNATURE 配置一致）
  static const bool signEnabled = false;

  /// 签名密钥（需与后端 SIGNATURE_SECRET 一致）
  static const String signatureSecret = 'your-api-signing-secret-change-me';
}

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final StorageService _storage = StorageService();

  /// 构建请求头（自动附加 token、签名）
  Future<Map<String, String>> _buildHeaders({
    required String method,
    required String endpoint,
    String? body,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    // 自动附加 token
    final token = await _storage.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    // 请求签名
    if (ApiConfig.signEnabled) {
      final timestamp = (DateTime.now().millisecondsSinceEpoch ~/ 1000).toString();
      final signString = '$method$endpoint${body ?? ''}$timestamp';
      final hmacSha256 = Hmac(sha256, utf8.encode(ApiConfig.signatureSecret));
      final digest = hmacSha256.convert(utf8.encode(signString));
      headers['X-Signature'] = digest.toString();
      headers['X-Timestamp'] = timestamp;
    }

    return headers;
  }

  Future<dynamic> get(String endpoint) async {
    try {
      final headers = await _buildHeaders(method: 'GET', endpoint: endpoint);
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: headers,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final body = json.encode(data);
      final headers = await _buildHeaders(
        method: 'POST',
        endpoint: endpoint,
        body: body,
      );
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: headers,
        body: body,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final body = json.encode(data);
      final headers = await _buildHeaders(
        method: 'PUT',
        endpoint: endpoint,
        body: body,
      );
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: headers,
        body: body,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> delete(String endpoint) async {
    try {
      final headers = await _buildHeaders(method: 'DELETE', endpoint: endpoint);
      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: headers,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<dynamic> patch(String endpoint, [Map<String, dynamic>? data]) async {
    try {
      final body = data != null ? json.encode(data) : null;
      final headers = await _buildHeaders(
        method: 'PATCH',
        endpoint: endpoint,
        body: body,
      );
      final response = await http.patch(
        Uri.parse('${ApiConfig.baseUrl}$endpoint'),
        headers: headers,
        body: body,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  dynamic _handleResponse(http.Response response) {
    final body = json.decode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      final message = body['message'] ?? body['error'] ?? '请求失败';
      throw Exception(message);
    }
  }
}
