# GitHub 自动部署说明

已在仓库工作流中启用 `main` 分支自动部署：
- 文件：`.github/workflows/ci.yml`
- 触发：`push` 到 `main`
- 前置：后端测试 + 前端构建全部通过
- 动作：通过 SSH 连接 VPS，执行
  - `systemctl start go-react-boot-update.service`
  - 读取部署日志
  - 本机健康检查 `http://127.0.0.1:8080/api/health`

## 1. 需要配置的 GitHub Secrets

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions -> New repository secret` 添加：

- `VPS_HOST`
  - 当前示例：`152.53.141.194`
- `VPS_USER`
  - 当前示例：`admin`
- `VPS_PORT`（可选）
  - 当前示例：`22`
  - 不填时默认 `22`
- `VPS_SSH_KEY_B64`（推荐）
  - 内容为部署私钥的 base64 单行字符串
- `VPS_SSH_KEY`
  - 备用方案：直接填写 SSH 私钥全文

密钥优先级说明：
- 如果 `VPS_SSH_KEY_B64` 已设置，工作流优先使用它
- 只有当 `VPS_SSH_KEY_B64` 为空时，才会回退到 `VPS_SSH_KEY`
- 如果你更新了 `VPS_SSH_KEY`，但旧的 `VPS_SSH_KEY_B64` 还在，GitHub Actions 仍会继续使用 `VPS_SSH_KEY_B64`

## 2. 推荐：创建单独 deploy key

在本机执行：

```bash
ssh-keygen -t ed25519 -f ~/.ssh/go-react-deploy -C "github-actions-deploy"
base64 < ~/.ssh/go-react-deploy | tr -d '\n'
```

将 `~/.ssh/go-react-deploy.pub` 加到服务器用户（推荐 `admin`）的 `~/.ssh/authorized_keys`。

推荐做法：
- 把第二条命令输出的单行内容保存到 GitHub Secret `VPS_SSH_KEY_B64`
- 或者删除 `VPS_SSH_KEY_B64`，只保留 `VPS_SSH_KEY`
- 不要同时保留“新 `VPS_SSH_KEY` + 旧 `VPS_SSH_KEY_B64`”这种混合状态

## 3. 新服务器首次安装

GitHub 自动部署依赖服务器上存在 `go-react-boot-update` 的 systemd 入口。

仓库内已提供可复用文件：
- `deploy/systemd/go-react-boot-update/go-react-boot-update.sh`
- `deploy/systemd/go-react-boot-update/go-react-boot-update.service`

在新服务器首次安装时，需要把它们放到：
- `/usr/local/bin/go-react-boot-update.sh`
- `/etc/systemd/system/go-react-boot-update.service`

然后执行：

```bash
sudo chmod 755 /usr/local/bin/go-react-boot-update.sh
sudo systemctl daemon-reload
```

## 4. 验证

1. 推送一次到 `main`
2. 打开 GitHub `Actions -> CI`
3. 查看 `deploy` job 成功
4. 服务器上可用命令查看日志：

```bash
journalctl -u go-react-boot-update.service -n 200 --no-pager
```

5. 服务器本机健康检查：

```bash
curl -sS http://127.0.0.1:8080/api/health
```
