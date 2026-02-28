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
  - 示例：`194.127.193.199`
- `VPS_USER`
  - 示例：`ops`（推荐）或 `root`
- `VPS_SSH_KEY`
  - 内容为 SSH 私钥全文（建议单独创建一把 deploy key）
- `VPS_PORT`（可选）
  - 默认 `22`

## 2. 推荐：创建单独 deploy key

在本机执行：

```bash
ssh-keygen -t ed25519 -f ~/.ssh/go-react-deploy -C "github-actions-deploy"
```

将 `~/.ssh/go-react-deploy.pub` 加到服务器用户（`ops`/`root`）的 `~/.ssh/authorized_keys`。  
将 `~/.ssh/go-react-deploy` 私钥内容保存到 GitHub Secret `VPS_SSH_KEY`。

## 3. 验证

1. 推送一次到 `main`
2. 打开 GitHub `Actions -> CI`
3. 查看 `deploy` job 成功
4. 服务器上可用命令查看日志：

```bash
journalctl -u go-react-boot-update.service -n 200 --no-pager
```
