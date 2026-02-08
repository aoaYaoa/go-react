function ApiDocs() {
  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-white">
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">API 接口文档</h1>
        <p className="text-gray-600 mt-1">基于 Swagger UI 的 RESTful API 文档</p>
      </div>
      <div className="flex-1 relative bg-gray-50">
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
              <meta charset="UTF-8">
              <title>API Documentation</title>
              <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
              <style>
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body>
              <div id="swagger-ui"></div>
              <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
              <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
              <script>
                window.onload = function() {
                  window.ui = SwaggerUIBundle({
                    url: "http://localhost:8080/swagger/doc.json",
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                      SwaggerUIBundle.presets.apis,
                      SwaggerUIStandalonePreset
                    ],
                    plugins: [
                      SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout"
                  });
                };
              </script>
            </body>
            </html>
          `}
          className="absolute inset-0 w-full h-full border-0"
          title="API Documentation"
        />
      </div>
    </div>
  )
}

export default ApiDocs
