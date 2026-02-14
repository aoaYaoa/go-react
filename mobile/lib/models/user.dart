class User {
  final String id;
  final String username;
  final String email;
  final String? avatar;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      avatar: json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'username': username, 'email': email, 'avatar': avatar};
  }
}
