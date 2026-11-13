window.Platform = window.Platform || {};

(function () {
  var TOKEN_KEY = "elsherbiny_auth_token";

  function getBaseUrl() {
    return (window.PLATFORM_CONFIG && window.PLATFORM_CONFIG.API_BASE_URL) || "";
  }

  function getToken() {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function setToken(token) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  async function request(path, options) {
    var opts = options || {};
    var headers = Object.assign({}, opts.headers || {});
    var token = getToken();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
    if (opts.body && !(opts.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    var res = await fetch(getBaseUrl() + path, {
      method: opts.method || "GET",
      headers: headers,
      body:
        opts.body && !(opts.body instanceof FormData) && typeof opts.body !== "string"
          ? JSON.stringify(opts.body)
          : opts.body
    });

    var data = {};
    try {
      data = await res.json();
    } catch (e) {}

    if (!res.ok) {
      var msg = data.detail || data.error || "تعذر إتمام الطلب، يرجى المحاولة مرة أخرى.";
      var err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  window.Platform.Api = {
    getToken: getToken,
    setToken: setToken,
    get: function (path) {
      return request(path, { method: "GET" });
    },
    post: function (path, body) {
      return request(path, { method: "POST", body: body });
    },
    put: function (path, body) {
      return request(path, { method: "PUT", body: body });
    },
    patch: function (path, body) {
      return request(path, { method: "PATCH", body: body });
    },
    del: function (path) {
      return request(path, { method: "DELETE" });
    },
    uploadFile: function (file) {
      var fd = new FormData();
      fd.append("file", file);
      return request("/api/admin/upload", { method: "POST", body: fd });
    }
  };
})();
