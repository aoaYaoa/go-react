import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme.dart';
import '../../../shared/mock/mock_data.dart';

/// 登录页面
///
/// 提供用户名/密码登录和生物识别登录（UI 占位）功能。
/// 当前阶段使用 Mock 数据模拟登录验证。
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// 执行登录操作
  /// 使用 Mock 数据验证用户名或邮箱是否匹配
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    // 模拟网络延迟
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;

    final input = _usernameController.text.trim();

    // 在 Mock 用户列表中查找匹配的用户名或邮箱
    final matchedUser = MockDataProvider.users.where(
      (u) => u.username == input || u.email == input,
    );

    setState(() => _isLoading = false);

    if (matchedUser.isNotEmpty) {
      // 登录成功，导航到首页
      if (mounted) {
        context.go('/');
      }
    } else {
      // 登录失败，显示错误提示
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('用户名或密码错误，请重试'),
            backgroundColor: AppTheme.errorColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
          ),
        );
      }
    }
  }

  /// 生物识别登录（UI 占位）
  void _handleBiometricLogin() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('生物识别功能将在后续版本中实现'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: AppTheme.spacingLg,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 品牌区域
                _buildBrandingSection(theme),
                const SizedBox(height: AppTheme.spacingXl),

                // 登录表单
                _buildLoginForm(theme),
                const SizedBox(height: AppTheme.spacingMd),

                // 登录按钮
                _buildLoginButton(),
                const SizedBox(height: AppTheme.spacingMd),

                // 分隔线
                _buildDivider(theme),
                const SizedBox(height: AppTheme.spacingMd),

                // 生物识别登录按钮
                _buildBiometricButton(theme),
                const SizedBox(height: AppTheme.spacingLg),

                // 注册入口
                _buildRegisterLink(theme),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// 品牌 Logo 和标题区域
  Widget _buildBrandingSection(ThemeData theme) {
    return Column(
      children: [
        // 应用图标
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppTheme.primaryColor,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          ),
          child: const Icon(
            Icons.flight,
            size: 40,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: AppTheme.spacingMd),
        Text(
          'SkyTracker',
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryColor,
          ),
        ),
        const SizedBox(height: AppTheme.spacingXs),
        Text(
          '航班与无人机智能追踪平台',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
        ),
      ],
    );
  }

  /// 登录表单（用户名 + 密码）
  Widget _buildLoginForm(ThemeData theme) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // 用户名/邮箱输入框
          TextFormField(
            controller: _usernameController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: '用户名 / 邮箱',
              hintText: '请输入用户名或邮箱',
              prefixIcon: Icon(Icons.person_outline),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return '请输入用户名或邮箱';
              }
              return null;
            },
          ),
          const SizedBox(height: AppTheme.spacingMd),

          // 密码输入框
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _handleLogin(),
            decoration: InputDecoration(
              labelText: '密码',
              hintText: '请输入密码',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
                onPressed: () {
                  setState(() => _obscurePassword = !_obscurePassword);
                },
              ),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return '请输入密码';
              }
              if (value.length < 6) {
                return '密码长度不能少于6位';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }

  /// 登录按钮
  Widget _buildLoginButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleLogin,
        child: _isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : const Text('登录'),
      ),
    );
  }

  /// 分隔线
  Widget _buildDivider(ThemeData theme) {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppTheme.spacingMd,
          ),
          child: Text(
            '其他登录方式',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
          ),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }

  /// 生物识别登录按钮（UI 占位）
  Widget _buildBiometricButton(ThemeData theme) {
    return OutlinedButton.icon(
      onPressed: _handleBiometricLogin,
      icon: const Icon(Icons.fingerprint),
      label: const Text('生物识别登录'),
    );
  }

  /// 注册入口链接
  Widget _buildRegisterLink(ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          '还没有账号？',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
        ),
        TextButton(
          onPressed: () => context.push('/register'),
          child: const Text('立即注册'),
        ),
      ],
    );
  }
}
