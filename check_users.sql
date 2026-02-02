-- 查询 users 表中的所有数据
SELECT 
    id,
    username,
    email,
    role,
    full_name,
    avatar_url,
    phone,
    created_at,
    updated_at
FROM public.users
ORDER BY created_at DESC;

-- 统计用户总数
SELECT COUNT(*) as total_users FROM public.users;

-- 查询最近注册的 5 个用户
SELECT 
    id,
    username,
    email,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;
