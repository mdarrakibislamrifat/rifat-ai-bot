const nextConfig = {
  async headers() {
    return [
      {
        source: "/chatbot/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};