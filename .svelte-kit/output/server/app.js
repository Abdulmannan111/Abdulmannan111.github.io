var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
import { promises } from "fs";
import path from "path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
const escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url2) => css2.add(url2));
      if (node.js)
        node.js.forEach((url2) => js.add(url2));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links2 = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${page2 && page2.path ? try_serialize(page2.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page2 && page2.query ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && page2.params ? try_serialize(page2.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links2,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url: url2, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url2)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url2;
        if (typeof resource === "string") {
          url2 = resource;
        } else {
          url2 = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url2.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url2.includes("?") ? url2.slice(url2.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url2,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url2}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url2);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url2, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url: url2,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path2) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path2);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path2.slice(path_match[0].length).split("/") : path2.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path2 = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path2 + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: null
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$3);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base = "";
let assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
const template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n\n<head>\n	<meta charset="utf-8" />\n	<link rel="icon" href="/images/file.png" />\n	<meta name="viewport" content="width=device-width, initial-scale=1" />\n	' + head + '\n</head>\n\n<body>\n	<div id="svelte">' + body + "</div>\n</body>\n\n</html>";
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-26382fc9.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-26382fc9.js", assets + "/_app/chunks/vendor-fb0024c4.js", assets + "/_app/chunks/preload-helper-ec9aa979.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
const d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
const empty = () => ({});
const manifest = {
  assets: [{ "file": "images/apple-touch-icon.png", "size": 783, "type": "image/png" }, { "file": "images/clients/cause.jpg", "size": 544026, "type": "image/jpeg" }, { "file": "images/clients/edition.png", "size": 208242, "type": "image/png" }, { "file": "images/clients/frisco.jpg", "size": 413010, "type": "image/jpeg" }, { "file": "images/clients/hydra.png", "size": 85844, "type": "image/png" }, { "file": "images/clients/justice.jpg", "size": 291577, "type": "image/jpeg" }, { "file": "images/clients/malt.jpg", "size": 472771, "type": "image/jpeg" }, { "file": "images/clients/urban.png", "size": 138045, "type": "image/png" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.07.24 PM.jpeg", "size": 64104, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.10.49 PM.jpeg", "size": 60827, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.26.33 PM.jpeg", "size": 26118, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.27.33 PM.jpeg", "size": 1858805, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.28.08 PM.jpeg", "size": 28347, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.29.59 PM.jpeg", "size": 95864, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.31.16 PM.jpeg", "size": 21823, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.33.25 PM.jpeg", "size": 92826, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.34.05 PM.jpeg", "size": 36407, "type": "image/jpeg" }, { "file": "images/clients/WhatsApp Image 2024-11-30 at 3.36.17 PM.jpeg", "size": 377614, "type": "image/jpeg" }, { "file": "images/cloudcannon-logo-blue.svg", "size": 5056, "type": "image/svg+xml" }, { "file": "images/favicon.png", "size": 480, "type": "image/png" }, { "file": "images/file.png", "size": 448865, "type": "image/png" }, { "file": "images/logo.svg", "size": 1688, "type": "image/svg+xml" }, { "file": "images/pattern.png", "size": 33702, "type": "image/png" }, { "file": "images/pixel.jpeg", "size": 56474, "type": "image/jpeg" }, { "file": "images/screenshot-buttons.svg", "size": 194, "type": "image/svg+xml" }, { "file": "images/svelte-horizontal.png", "size": 43636, "type": "image/png" }, { "file": "images/touch-icon.png", "size": 813, "type": "image/png" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "endpoint",
      pattern: /^\/index\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_json;
      })
    },
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/portfolio\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return portfolio_json;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/sitemap\.xml$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return sitemap_xml;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/about\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return about_json;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/blog\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return blog_json;
      })
    },
    {
      type: "page",
      pattern: /^\/portfolio\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/portfolio.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/feed\.xml$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return feed_xml;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/clients\/([^/]+?)\.json$/,
      params: (m) => ({ client: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _client__json;
      })
    },
    {
      type: "page",
      pattern: /^\/clients\/([^/]+?)\/?$/,
      params: (m) => ({ client: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/clients/[client].svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/contact\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/contact.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/blog\/([^/]+?)\.json$/,
      params: (m) => ({ slug: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _slug__json$1;
      })
    },
    {
      type: "page",
      pattern: /^\/blog\/([^/]+?)\/?$/,
      params: (m) => ({ slug: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/blog/[slug].svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/([^/]+?)\.json$/,
      params: (m) => ({ slug: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _slug__json;
      })
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/?$/,
      params: (m) => ({ slug: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[slug].svelte"],
      b: ["src/routes/__error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/portfolio.svelte": () => Promise.resolve().then(function() {
    return portfolio;
  }),
  "src/routes/clients/[client].svelte": () => Promise.resolve().then(function() {
    return _client_;
  }),
  "src/routes/contact.svelte": () => Promise.resolve().then(function() {
    return contact;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  }),
  "src/routes/blog/[slug].svelte": () => Promise.resolve().then(function() {
    return _slug_$1;
  }),
  "src/routes/blog.svelte": () => Promise.resolve().then(function() {
    return blog;
  }),
  "src/routes/[slug].svelte": () => Promise.resolve().then(function() {
    return _slug_;
  })
};
const metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-dbe354d1.js", "css": ["assets/pages/__layout.svelte-79261281.css"], "js": ["pages/__layout.svelte-dbe354d1.js", "chunks/vendor-fb0024c4.js", "chunks/company-409b835e.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-54eb0c24.js", "css": [], "js": ["pages/__error.svelte-54eb0c24.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-8bbf87b8.js", "css": [], "js": ["pages/index.svelte-8bbf87b8.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js"], "styles": [] }, "src/routes/portfolio.svelte": { "entry": "pages/portfolio.svelte-fd8e0ffe.js", "css": ["assets/pages/portfolio.svelte-12dab425.css"], "js": ["pages/portfolio.svelte-fd8e0ffe.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js"], "styles": [] }, "src/routes/clients/[client].svelte": { "entry": "pages/clients/[client].svelte-e8c59337.js", "css": [], "js": ["pages/clients/[client].svelte-e8c59337.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js"], "styles": [] }, "src/routes/contact.svelte": { "entry": "pages/contact.svelte-89c4f5b1.js", "css": ["assets/pages/contact.svelte-f1169e8a.css"], "js": ["pages/contact.svelte-89c4f5b1.js", "chunks/preload-helper-ec9aa979.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js"], "styles": [] }, "src/routes/about.svelte": { "entry": "pages/about.svelte-5d0dcb6d.js", "css": ["assets/pages/about.svelte-0e25a92e.css"], "js": ["pages/about.svelte-5d0dcb6d.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js", "chunks/AuthorCard-512807b8.js"], "styles": [] }, "src/routes/blog/[slug].svelte": { "entry": "pages/blog/[slug].svelte-4d9b5257.js", "css": [], "js": ["pages/blog/[slug].svelte-4d9b5257.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js", "chunks/AuthorCard-512807b8.js", "chunks/PostSummary-81fef710.js"], "styles": [] }, "src/routes/blog.svelte": { "entry": "pages/blog.svelte-57829c84.js", "css": [], "js": ["pages/blog.svelte-57829c84.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js", "chunks/PostSummary-81fef710.js"], "styles": [] }, "src/routes/[slug].svelte": { "entry": "pages/[slug].svelte-45d86a19.js", "css": [], "js": ["pages/[slug].svelte-45d86a19.js", "chunks/vendor-fb0024c4.js", "chunks/Page-43ba8f74.js", "chunks/company-409b835e.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render$2(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
const { readdir, readFile } = promises;
const md = new MarkdownIt({ html: true });
const collectionsDirectory = path.join(process.cwd(), "content");
async function getCollection(collection, options2 = {}) {
  const fileNames = await readdir(path.join(collectionsDirectory, collection));
  const collectionItems = await Promise.all(await fileNames.reduce(async (memo, fileName) => {
    const slug = path.basename(fileName, path.extname(fileName));
    if (!slug.startsWith("_")) {
      const item = await getCollectionItem(collection, slug, options2);
      return [...await memo, item];
    }
    return memo;
  }, []));
  if (options2.sortKey) {
    return collectionItems.sort((a, b) => {
      if (a[options2.sortKey] === b[options2.sortKey]) {
        return 0;
      }
      return a[options2.sortKey] > b[options2.sortKey] ? -1 : 1;
    });
  }
  return collectionItems;
}
async function getCollectionItem(collection, slug, options2 = {}) {
  const fullPath = path.join(collectionsDirectory, collection, `${slug}.md`);
  const fileContents = await readFile(fullPath, "utf8");
  const parsed = matter(fileContents);
  const contentHtml = parsed.data.content_html || md.render(parsed.content || "");
  if (options2.excerpt) {
    parsed.data.excerpt_html = parsed.data.excerpt_html || md.renderInline(parsed.content.split("\n").slice(1, 2).join(" "));
  }
  return {
    ...parsed.data,
    slug,
    content_html: contentHtml
  };
}
async function getNextCollectionItem(collection, slug, options2 = {}) {
  const collectionItems = await getCollection(collection, options2);
  const index2 = collectionItems.map(function(e) {
    return e.slug;
  }).indexOf(slug);
  return collectionItems[index2 + 1];
}
async function get$8() {
  const pageDetails = await getCollectionItem("pages", "index");
  const clients = await getCollection("clients");
  return {
    body: {
      pageDetails,
      clients
    }
  };
}
var index_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$8
});
async function get$7() {
  const pageDetails = await getCollectionItem("pages", "portfolio");
  const clients = await getCollection("clients");
  return {
    body: {
      pageDetails,
      clients
    }
  };
}
var portfolio_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$7
});
const url = "https://example.com/";
const baseurl = "";
const google_analytics_key = null;
const google_maps_javascript_api_key = null;
var siteData = {
  url,
  baseurl,
  google_analytics_key,
  google_maps_javascript_api_key
};
const render$1 = (posts, pages) => {
  const now = new Date();
  const renderItem = (item, baseUrl) => {
    if (item.sitemap === false) {
      return "";
    }
    const slug = item.slug === "index" ? "" : `${item.slug}`;
    return `<url>
			<loc>${siteData.url}${baseUrl}${slug}</loc>
			<lastmod>${(item.date ? new Date(item.date) : now).toISOString()}</lastmod>
		</url>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${posts.map((post) => renderItem(post, "blog/")).join("\n")}
	${pages.map((page2) => renderItem(page2, "")).join("\n")}
</urlset>`;
};
async function get$6() {
  const posts = await getCollection("posts");
  const pages = await getCollection("pages");
  return { body: render$1(posts, pages) };
}
var sitemap_xml = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$6
});
async function get$5() {
  const pageDetails = await getCollectionItem("pages", "index");
  const staffMembers = await getCollection("staff-members");
  return {
    body: {
      pageDetails,
      staffMembers
    }
  };
}
var about_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$5
});
async function get$4() {
  const pageDetails = await getCollectionItem("pages", "blog");
  const postsWithoutAuthor = await getCollection("posts", { excerpt: true, sortKey: "date" });
  const posts = await Promise.all(postsWithoutAuthor.map(async (post) => {
    const author2 = await getCollectionItem("staff-members", post.author_staff_member);
    return { ...post, author: author2 };
  }));
  return {
    body: {
      pageDetails,
      posts
    }
  };
}
var blog_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$4
});
const site_name = "Pixel Pulse";
const site_title$1 = "";
const description$1 = "Pixel Pulse offers services including social media management, performance marketing, Google Ads and SEO, production services (event coverage), and software solutions (mobile applications and website development).";
const author = "";
const author_email = "";
const images = [];
const _array_structures = {
  images: {
    style: "select",
    values: [
      {
        label: "Image",
        icon: "image",
        value: {
          image: "",
          description: "",
          height: 0,
          width: 0
        }
      }
    ]
  }
};
var seoData = {
  site_name,
  site_title: site_title$1,
  description: description$1,
  author,
  author_email,
  images,
  _array_structures
};
const render = (posts) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
	<channel>
		<title><![CDATA[${seoData.site_title}]]></title>
		<link>${siteData.url}</link>
		<description><![CDATA[${seoData.description}]]></description>
		<atom:link href="${siteData.url}rss.xml" rel="self" type="application/rss+xml" />
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		${posts.map((post) => `
		<item>
			<title><![CDATA[${post.title || ""}]]></title>
			<description><![CDATA[${post.description || post.excerpt_html || ""}]]></description>
			<link>${siteData.url}blog/${post.slug}</link>
			<guid isPermaLink="true">${siteData.url}blog/${post.slug}</guid>
			<pubDate>${new Date(post.date).toUTCString()}</pubDate>
		</item>`).join("\n")}
	</channel>
</rss>`;
async function get$3() {
  const posts = await getCollection("posts", { excerpt: true, sortKey: "date" });
  return { body: render(posts) };
}
var feed_xml = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$3
});
async function get$2({ params }) {
  const { client } = params;
  const pageDetails = await getCollectionItem("clients", client);
  const portfolio2 = await getCollectionItem("pages", "portfolio");
  return {
    body: {
      pageDetails,
      portfolio: portfolio2
    }
  };
}
var _client__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$2
});
async function get$1({ params }) {
  const pageDetails = await getCollectionItem("posts", params.slug);
  const author2 = await getCollectionItem("staff-members", pageDetails.author_staff_member);
  const nextPost = await getNextCollectionItem("posts", params.slug, { excerpt: true, sortKey: "date" });
  return {
    body: {
      pageDetails,
      author: author2,
      nextPost: nextPost ? nextPost : null
    }
  };
}
var _slug__json$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
async function get({ params }) {
  const { slug } = params;
  const pageDetails = await getCollectionItem("pages", slug);
  return {
    body: {
      pageDetails
    }
  };
}
var _slug__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var main = "";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const links = [
  {
    name: "Home",
    link: "/"
  },
  {
    name: "Portfolio",
    link: "/portfolio"
  },
  {
    name: "Contact",
    link: "/contact/"
  }
];
var footerData = [
  {
    title: "Pages",
    links: [
      {
        name: "Home",
        link: "/"
      },
      {
        name: "Portfolio",
        link: "/portfolio"
      },
      {
        name: "Contact",
        link: "/contact"
      }
    ]
  },
  {
    title: "Social",
    links: [
      {
        name: "Facebook",
        link: "https://www.facebook.com/profile.php?id=61561496391100&mibextid=LQQJ4d&mibextid=LQQJ4d",
        social_icon: "Facebook",
        new_window: true
      },
      {
        name: "Instagram",
        link: "https://www.instagram.com/pixelpulse856/profilecard/?igsh=OWVsaDM0dzhrM3Ft",
        social_icon: "Instagram",
        new_window: true
      }
    ]
  }
];
const site_title = "Pixel Pulse";
const description = "Delivering exceptional experiences to our clients.";
const contact_email_address = "PixelP856@gmail.com";
const phone = "03351474000";
const address = "123 Example Street, Gooseburb, 9876, Ducktown, New Zealand";
const postal_address = "PO Box 123, Ducktown, New Zealand";
var company = {
  site_title,
  description,
  contact_email_address,
  phone,
  address,
  postal_address
};
const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const icons = {
    Facebook: '<path d="M19,4V7H17A1,1 0 0,0 16,8V10H19V13H16V20H13V13H11V10H13V7.5C13,5.56 14.57,4 16.5,4M20,2H4A2,2 0 0,0 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z" />',
    Instagram: '<path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />',
    LinkedIn: '<path d="M19,19H16V13.7A1.5,1.5 0 0,0 14.5,12.2A1.5,1.5 0 0,0 13,13.7V19H10V10H13V11.2C13.5,10.36 14.59,9.8 15.5,9.8A3.5,3.5 0 0,1 19,13.3M6.5,8.31C5.5,8.31 4.69,7.5 4.69,6.5A1.81,1.81 0 0,1 6.5,4.69C7.5,4.69 8.31,5.5 8.31,6.5A1.81,1.81 0 0,1 6.5,8.31M8,19H5V10H8M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z" />',
    Pinterest: '<path d="M13,16.2C12.2,16.2 11.43,15.86 10.88,15.28L9.93,18.5L9.86,18.69L9.83,18.67C9.64,19 9.29,19.2 8.9,19.2C8.29,19.2 7.8,18.71 7.8,18.1C7.8,18.05 7.81,18 7.81,17.95H7.8L7.85,17.77L9.7,12.21C9.7,12.21 9.5,11.59 9.5,10.73C9.5,9 10.42,8.5 11.16,8.5C11.91,8.5 12.58,8.76 12.58,9.81C12.58,11.15 11.69,11.84 11.69,12.81C11.69,13.55 12.29,14.16 13.03,14.16C15.37,14.16 16.2,12.4 16.2,10.75C16.2,8.57 14.32,6.8 12,6.8C9.68,6.8 7.8,8.57 7.8,10.75C7.8,11.42 8,12.09 8.34,12.68C8.43,12.84 8.5,13 8.5,13.2A1,1 0 0,1 7.5,14.2C7.13,14.2 6.79,14 6.62,13.7C6.08,12.81 5.8,11.79 5.8,10.75C5.8,7.47 8.58,4.8 12,4.8C15.42,4.8 18.2,7.47 18.2,10.75C18.2,13.37 16.57,16.2 13,16.2M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z" />',
    Tumblr: '<path d="M16,11H13V14.9C13,15.63 13.14,16 14.1,16H16V19C16,19 14.97,19.1 13.9,19.1C11.25,19.1 10,17.5 10,15.7V11H8V8.2C10.41,8 10.62,6.16 10.8,5H13V8H16M20,2H4C2.89,2 2,2.89 2,4V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V4C22,2.89 21.1,2 20,2Z" />',
    Twitter: '<path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />',
    YouTube: '<path d="M10,16.5V7.5L16,12M20,4.4C19.4,4.2 15.7,4 12,4C8.3,4 4.6,4.19 4,4.38C2.44,4.9 2,8.4 2,12C2,15.59 2.44,19.1 4,19.61C4.6,19.81 8.3,20 12,20C15.7,20 19.4,19.81 20,19.61C21.56,19.1 22,15.59 22,12C22,8.4 21.56,4.91 20,4.4Z" />',
    RSS: '<path d="M0 0h24v24H0z" fill="none"/><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>'
  };
  let { icon } = $$props;
  let chosenIcon = icons[icon];
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0)
    $$bindings.icon(icon);
  return `<svg fill="${"#000000"}" height="${"24"}" viewBox="${"0 0 24 24"}" width="${"24"}" xmlns="${"https://www.w3.org/2000/svg"}"><!-- HTML_TAG_START -->${chosenIcon}<!-- HTML_TAG_END --></svg>`;
});
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let active_tab;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let navLinks = links;
  active_tab = `${$page.path}/`;
  $$unsubscribe_page();
  return `<header><div class="${"container"}"><h1 class="${"company-name"}"><a href="${"/"}"><img src="${"/images/file.png"}" alt="${"Pixel Pulse"}" width="${"150"}"></a></h1>
		<nav><a class="${"nav-toggle"}" id="${"open-nav"}">\u2630</a>
			<ul>${each(navLinks, (navLink) => `<li><a${add_attribute("class", active_tab === navLink.link ? "active" : "", 0)}${add_attribute("href", navLink.link, 0)}>${escape(navLink.name)}</a></li>`)}</ul></nav></div></header>

${slots.default ? slots.default({}) : ``}

<footer class="${"diagonal"}"><div class="${"container"}"><p class="${"editor-link"}"><a href="${"cloudcannon:data/data/footer.json"}" class="${"btn"}"><strong>\u270E</strong> Edit Footer</a></p>
		<div class="${"footer-columns"}">${each(footerData, (column, index2) => `<ul class="${"footer-links"}"><li><h2>${escape(column.title)}</h2></li>

					${each(column.links, (link, index3) => `<li><a${add_attribute("href", link.link, 0)}${add_attribute("target", link.new_window ? "_blank" : "_self", 0)}>${link.social_icon ? `${validate_component(Icon, "Icon").$$render($$result, { icon: link.social_icon }, {}, {})}` : ``}${escape(link.name)}</a>
						</li>`)}
				</ul>`)}

			<ul class="${"footer-links"}"><li><h2>${escape(company.site_title)}</h2></li>
				<li>${escape(company.description)}</li></ul></div></div>

	<div class="${"legal-line"}"><p class="${"container"}">\xA9 ${escape(new Date().getFullYear())}
			${escape(company.site_title)}</p></div></footer>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
const SvelteSeo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title = void 0 } = $$props;
  let { noindex = false } = $$props;
  let { nofollow = false } = $$props;
  let { description: description2 = void 0 } = $$props;
  let { keywords = void 0 } = $$props;
  let { canonical = void 0 } = $$props;
  let { openGraph = void 0 } = $$props;
  let { twitter = void 0 } = $$props;
  let { jsonLd = void 0 } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.noindex === void 0 && $$bindings.noindex && noindex !== void 0)
    $$bindings.noindex(noindex);
  if ($$props.nofollow === void 0 && $$bindings.nofollow && nofollow !== void 0)
    $$bindings.nofollow(nofollow);
  if ($$props.description === void 0 && $$bindings.description && description2 !== void 0)
    $$bindings.description(description2);
  if ($$props.keywords === void 0 && $$bindings.keywords && keywords !== void 0)
    $$bindings.keywords(keywords);
  if ($$props.canonical === void 0 && $$bindings.canonical && canonical !== void 0)
    $$bindings.canonical(canonical);
  if ($$props.openGraph === void 0 && $$bindings.openGraph && openGraph !== void 0)
    $$bindings.openGraph(openGraph);
  if ($$props.twitter === void 0 && $$bindings.twitter && twitter !== void 0)
    $$bindings.twitter(twitter);
  if ($$props.jsonLd === void 0 && $$bindings.jsonLd && jsonLd !== void 0)
    $$bindings.jsonLd(jsonLd);
  return `${$$result.head += `${title ? `${$$result.title = `<title>${escape(title)}</title>`, ""}` : ``}<meta name="${"robots"}"${add_attribute("content", `${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`, 0)} data-svelte="svelte-48x7jy"><meta name="${"googlebot"}"${add_attribute("content", `${noindex ? "noindex" : "index"},${nofollow ? "nofollow" : "follow"}`, 0)} data-svelte="svelte-48x7jy">${description2 ? `<meta name="${"description"}"${add_attribute("content", description2, 0)} data-svelte="svelte-48x7jy">` : ``}${canonical ? `<link rel="${"canonical"}"${add_attribute("href", canonical, 0)} data-svelte="svelte-48x7jy">` : ``}${keywords ? `<meta name="${"keywords"}"${add_attribute("content", keywords, 0)} data-svelte="svelte-48x7jy">` : ``}${openGraph ? `${openGraph.title ? `<meta property="${"og:title"}"${add_attribute("content", openGraph.title, 0)} data-svelte="svelte-48x7jy">` : ``}

    ${openGraph.description ? `<meta property="${"og:description"}"${add_attribute("content", openGraph.description, 0)} data-svelte="svelte-48x7jy">` : ``}

    ${openGraph.url || canonical ? `<meta property="${"og:url"}"${add_attribute("content", openGraph.url || canonical, 0)} data-svelte="svelte-48x7jy">` : ``}

    ${openGraph.type ? `<meta property="${"og:type"}"${add_attribute("content", openGraph.type.toLowerCase(), 0)} data-svelte="svelte-48x7jy">` : ``}

    ${openGraph.article ? `${openGraph.article.publishedTime ? `<meta property="${"article:published_time"}"${add_attribute("content", openGraph.article.publishedTime, 0)} data-svelte="svelte-48x7jy">` : ``}

      ${openGraph.article.modifiedTime ? `<meta property="${"article:modified_time"}"${add_attribute("content", openGraph.article.modifiedTime, 0)} data-svelte="svelte-48x7jy">` : ``}

      ${openGraph.article.expirationTime ? `<meta property="${"article:expiration_time"}"${add_attribute("content", openGraph.article.expirationTime, 0)} data-svelte="svelte-48x7jy">` : ``}

      ${openGraph.article.section ? `<meta property="${"article:section"}"${add_attribute("content", openGraph.article.section, 0)} data-svelte="svelte-48x7jy">` : ``}

      ${openGraph.article.authors && openGraph.article.authors.length ? `${each(openGraph.article.authors, (author2) => `<meta property="${"article:author"}"${add_attribute("content", author2, 0)} data-svelte="svelte-48x7jy">`)}` : ``}

      ${openGraph.article.tags && openGraph.article.tags.length ? `${each(openGraph.article.tags, (tag) => `<meta property="${"article:tag"}"${add_attribute("content", tag, 0)} data-svelte="svelte-48x7jy">`)}` : ``}` : ``}

    ${openGraph.images && openGraph.images.length ? `${each(openGraph.images, (image) => `<meta property="${"og:image"}"${add_attribute("content", image.url, 0)} data-svelte="svelte-48x7jy">
        ${image.alt ? `<meta property="${"og:image:alt"}"${add_attribute("content", image.alt, 0)} data-svelte="svelte-48x7jy">` : ``}
        ${image.width ? `<meta property="${"og:image:width"}"${add_attribute("content", image.width.toString(), 0)} data-svelte="svelte-48x7jy">` : ``}
        ${image.height ? `<meta property="${"og:image:height"}"${add_attribute("content", image.height.toString(), 0)} data-svelte="svelte-48x7jy">` : ``}`)}` : ``}` : ``}${twitter ? `<meta name="${"twitter:card"}" content="${"summary_large_image"}" data-svelte="svelte-48x7jy">
    ${twitter.site ? `<meta name="${"twitter:site"}"${add_attribute("content", twitter.site, 0)} data-svelte="svelte-48x7jy">` : ``}
    ${twitter.title ? `<meta name="${"twitter:title"}"${add_attribute("content", twitter.title, 0)} data-svelte="svelte-48x7jy">` : ``}
    ${twitter.description ? `<meta name="${"twitter:description"}"${add_attribute("content", twitter.description, 0)} data-svelte="svelte-48x7jy">` : ``}
    ${twitter.image ? `<meta name="${"twitter:image"}"${add_attribute("content", twitter.image, 0)} data-svelte="svelte-48x7jy">` : ``}
    ${twitter.imageAlt ? `<meta name="${"twitter:image:alt"}"${add_attribute("content", twitter.imageAlt, 0)} data-svelte="svelte-48x7jy">` : ``}` : ``}${jsonLd ? `<!-- HTML_TAG_START -->${`<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    ...jsonLd
  }) + "<"}/script>`}<!-- HTML_TAG_END -->` : ``}${slots.default ? slots.default({}) : ``}`, ""}`;
});
const GoogleAnalytics = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${``}`, ""}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let heading;
  let browserTitle;
  let description2;
  let canonical;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { withContactButton = false } = $$props;
  let { pageDetails = {} } = $$props;
  const images2 = seoData.images.map((image) => ({
    url: image.image,
    width: image.height,
    height: image.width,
    alt: image.description
  }));
  if ($$props.withContactButton === void 0 && $$bindings.withContactButton && withContactButton !== void 0)
    $$bindings.withContactButton(withContactButton);
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  heading = pageDetails.heading || pageDetails.title;
  browserTitle = pageDetails.title ? `${pageDetails.title}  ${seoData.site_title}` : seoData.site_title;
  description2 = pageDetails.description || seoData.description;
  canonical = `${siteData.url}/${$page.path}`.replace(/\/+/g, "/");
  $$unsubscribe_page();
  return `${validate_component(SvelteSeo, "SvelteSeo").$$render($$result, {
    title: heading,
    canonical,
    description: description2,
    openGraph: {
      site_name: seoData.site_name,
      url: siteData.url,
      title: heading,
      description: description2,
      images: images2
    }
  }, {}, {})}

${validate_component(GoogleAnalytics, "GoogleAnalytics").$$render($$result, {}, {}, {})}

${$$result.head += `${$$result.title = `<title>${escape(browserTitle)}</title>`, ""}<link rel="${"alternate"}" type="${"application/rss+xml"}"${add_attribute("title", company.company_name, 0)} href="${"/feed.xml"}" data-svelte="svelte-12ka7hv"><link rel="${"sitemap"}" type="${"application/xml"}" title="${escape(company.company_name) + " - Sitemap"}" href="${"/sitemap.xml"}" data-svelte="svelte-12ka7hv">`, ""}

<section class="${"hero diagonal"}"><div class="${"container"}" style="${"position: relative;"}"><canvas id="${"polygonCanvas"}" style="${"position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;"}"></canvas>
		<div style="${"position: relative; z-index: 1;"}">${slots.heading ? slots.heading({}) : `
				<h2>${escape(heading)}</h2>
			`}

			${pageDetails.subtitle ? `<p class="${"subtext"}">${escape(pageDetails.subtitle)}</p>` : ``}
			${pageDetails.subtext_html ? `<p class="${"subtext"}"><!-- HTML_TAG_START -->${pageDetails.subtext_html}<!-- HTML_TAG_END --></p>` : ``}
			${withContactButton ? `<p><a class="${"button alt"}"${add_attribute("href", `${siteData.baseurl}/contact`, 0)}>Contact Us</a></p>` : ``}</div></div></section>

${slots.default ? slots.default({}) : ``}`;
});
function load$8({ error: error2, status }) {
  return {
    props: { message: error2.message, status }
  };
}
const _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails: { title: "Not Found" } }, {}, {
    default: () => `<section class="${"diagonal"}"><div class="${"container"}"><p>This page does not exist</p></div></section>`
  })}`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error,
  load: load$8
});
let listeners = [];
async function stopCloudCannonChanges() {
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    document.removeEventListener("cloudcannon:update", listener);
  }
  listeners = [];
}
async function load$7({ fetch: fetch2 }) {
  const res = await fetch2("index.json");
  if (res.ok) {
    return { props: res.json() };
  }
}
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageDetails } = $$props;
  let { clients } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  let clientsPreview = clients.slice(0, 4);
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  if ($$props.clients === void 0 && $$bindings.clients && clients !== void 0)
    $$bindings.clients(clients);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails, withContactButton: "true" }, {}, {
    default: () => `<section class="${"diagonal patterned"}"><div class="${"container"}"><div class="${"stats"}"><div class="${"stat"}"><div class="${"number"}" id="${"yearsCount"}">0</div>
					<div class="${"label"}">Years Of Experience</div></div>
				<div class="${"stat"}"><div class="${"number"}" id="${"clientsCount"}">0</div>
					<div class="${"label"}">Satisfied Clients</div></div>
				<div class="${"stat"}"><div class="${"number"}" id="${"websitesCount"}">0</div>
					<div class="${"label"}">Websites Developed</div></div></div>

			<div class="${"halves"}"><div><h3>${escape(pageDetails.portfolio_heading)}</h3>
					<p><!-- HTML_TAG_START -->${pageDetails.portfolio_description_html}<!-- HTML_TAG_END --></p>

					<p><a${add_attribute("href", `${siteData.baseurl}/portfolio`, 0)}>${escape(pageDetails.portfolio_call_to_action)} \u2192</a></p></div>
				<div><ul class="${"image-grid"}">${each(clientsPreview, (client, index2) => `<li><img${add_attribute("src", client.image_path, 0)}${add_attribute("alt", client.name, 0)}>
							</li>`)}</ul></div></div></div>

		<style>.stats {
				display: flex;
				justify-content: space-around;
				margin: 2em 0;
				text-align: center;
			}

			.stat {
				padding: 1em;
			}

			.number {
				font-size: 3em;
				font-weight: bold;
				margin-bottom: 0.2em;
			}

			.label {
				font-size: 1.2em;
			}
		</style></section>`
  })}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  load: load$7
});
var portfolio_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: '.diagonal.patterned.svelte-1h3mmx7.svelte-1h3mmx7{padding:20px;background:#f9f9f9}.container.svelte-1h3mmx7.svelte-1h3mmx7{max-width:1200px;margin:0 auto}.image-grid.svelte-1h3mmx7.svelte-1h3mmx7{display:grid;grid-template-columns:repeat(auto-fill, minmax(250px, 1fr));gap:20px;list-style:none;padding:0}.image-grid.svelte-1h3mmx7 li.svelte-1h3mmx7{background:white;border:1px solid #ddd;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1);transition:transform 0.3s,\n			box-shadow 0.3s;transform:scale(1);position:relative;opacity:0;animation:svelte-1h3mmx7-fadeIn 0.5s ease-in-out forwards}.image-grid.svelte-1h3mmx7 li img.svelte-1h3mmx7{width:100%;height:auto;object-fit:cover;transition:transform 0.3s ease-in-out}.image-grid.svelte-1h3mmx7 li.svelte-1h3mmx7:hover{transform:scale(1.05);box-shadow:0 8px 16px rgba(0, 0, 0, 0.2)}.image-container.svelte-1h3mmx7.svelte-1h3mmx7{overflow:hidden;position:relative}.image-container.svelte-1h3mmx7 img.svelte-1h3mmx7{transition:transform 0.5s ease-in-out}.image-container.svelte-1h3mmx7:hover img.svelte-1h3mmx7{transform:scale(1.2) rotate(2deg)}.details.svelte-1h3mmx7.svelte-1h3mmx7{padding:10px;text-align:center;position:relative;background-color:#fff;z-index:2}.name.svelte-1h3mmx7.svelte-1h3mmx7{font-weight:bold;font-size:1.2rem}@keyframes svelte-1h3mmx7-fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}p.editor-link.svelte-1h3mmx7.svelte-1h3mmx7{text-align:"center"}',
  map: null
};
async function load$6({ fetch: fetch2 }) {
  const res = await fetch2("portfolio.json");
  if (res.ok) {
    return { props: res.json() };
  }
}
const Portfolio = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageDetails, clients } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  if ($$props.clients === void 0 && $$bindings.clients && clients !== void 0)
    $$bindings.clients(clients);
  $$result.css.add(css$2);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {
    default: () => `<section class="${"diagonal patterned svelte-1h3mmx7"}"><div class="${"container svelte-1h3mmx7"}"><p class="${"editor-link svelte-1h3mmx7"}"><a href="${"cloudcannon:collections/content/clients/"}" class="${"btn"}"><strong>\u270E</strong> Manage Clients
				</a></p>
			<ul class="${"image-grid svelte-1h3mmx7"}">${each(clients, (client, index2) => `<li style="${"animation-delay: " + escape(index2 * 200) + "ms;"}" class="${"svelte-1h3mmx7"}"><div class="${"details svelte-1h3mmx7"}"><div class="${"name svelte-1h3mmx7"}">${escape(client.name)}</div></div>

						<div class="${"image-container svelte-1h3mmx7"}"><img${add_attribute("src", client.image_path, 0)}${add_attribute("alt", client.name, 0)} class="${"svelte-1h3mmx7"}"></div>
					</li>`)}</ul></div></section>`
  })}`;
});
var portfolio = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Portfolio,
  load: load$6
});
async function load$5({ page: page2, fetch: fetch2 }) {
  const { client } = page2.params;
  const url2 = `/clients/${client}.json`;
  const res = await fetch2(url2);
  if (res.ok) {
    return { props: res.json() };
  }
}
const U5Bclientu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageDetails, portfolio: portfolio2 } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  if ($$props.portfolio === void 0 && $$bindings.portfolio && portfolio2 !== void 0)
    $$bindings.portfolio(portfolio2);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {
    heading: () => `<h2 slot="${"heading"}"><a href="${escape(siteData.baseurl) + "/portfolio"}">${escape(portfolio2.heading)}</a> <span>/ ${escape(pageDetails.name)}</span></h2>`,
    default: () => `<section class="${"diagonal"}"><div class="${"container"}"><p><img${add_attribute("src", pageDetails.image_path, 0)} class="${"screenshot"}"${add_attribute("alt", pageDetails.title, 0)}></p>
			<div><div class="${"post-content"}"><!-- HTML_TAG_START -->${pageDetails.content_html}<!-- HTML_TAG_END --></div></div>
			<p><a${add_attribute("href", pageDetails.external_url, 0)}>View ${escape(pageDetails.name)} \u2192</a></p></div></section>`
  })}`;
});
var _client_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bclientu5D,
  load: load$5
});
var contact_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: 'input[name="_gotcha"].svelte-f2gfbz{display:none}',
  map: null
};
async function load$4({ fetch: fetch2 }) {
  const res = await fetch2("contact.json");
  if (res.ok) {
    return { props: res.json() };
  }
}
const Contact = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageDetails } = $$props;
  let mapEl;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  $$result.css.add(css$1);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {
    default: () => `<section class="${"diagonal"}"><div class="${"container"}"><form action="${"https://getform.io/f/bwnnkxna"}" method="${"POST"}" class="${"contact-form"}"><input type="${"text"}" name="${"_gotcha"}" style="${"display:none"}" class="${"svelte-f2gfbz"}">

				<div class="${"halves"}"><div><label for="${"first-name"}">First Name</label>
						<input type="${"text"}" name="${"first-name"}" id="${"first-name"}"></div>

					<div><label for="${"last-name"}">Last Name</label>
						<input type="${"text"}" name="${"last-name"}" id="${"last-name"}"></div></div>

				<label for="${"email"}">Email Address</label>
				<input type="${"email"}" name="${"email"}" id="${"email"}" required>

				<label for="${"message"}">Message</label>
				<textarea name="${"message"}" id="${"message"}"></textarea>

				<input type="${"submit"}" value="${"Send Message"}"></form></div></section>
	<section class="${"diagonal map"}"><div id="${"map"}"${add_attribute("this", mapEl, 0)}></div></section>

	<section class="${"diagonal"}"><div class="${"container halves aligned-top"}"><div><h3>Address</h3>
				<address><a target="${"_blank"}"${add_attribute("href", "https://www.google.com/maps/place/" + encodeURIComponent("Lahore, Pakistan"), 0)} rel="${"noreferrer"}"><!-- HTML_TAG_START -->${"Lahore,</br>Pakistan"}<!-- HTML_TAG_END --></a></address></div>
			<div><h3>Email</h3>
				<p><a${add_attribute("href", "mailto:" + company.contact_email_address, 0)}>${escape(company.contact_email_address)}</a></p></div></div></section>`
  })}`;
});
var contact = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Contact,
  load: load$4
});
const AuthorCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { author: author2 } = $$props;
  if ($$props.author === void 0 && $$bindings.author && author2 !== void 0)
    $$bindings.author(author2);
  return `<a target="${"_blank"}"${add_attribute("href", "https://twitter.com/" + author2.twitter, 0)} rel="${"noreferrer"}"><div class="${"square-image"}"><img${add_attribute("src", author2.image_path, 0)}${add_attribute("alt", author2.name, 0)}></div>
	<div class="${"details"}"><div class="${"name"}">${escape(author2.name)}</div>
		<div class="${"position"}">${escape(author2.position)}</div></div></a>`;
});
var about_svelte_svelte_type_style_lang = "";
const css = {
  code: "p.editor-link.svelte-16zwu5m{text-align:'center'}",
  map: null
};
async function load$3({ fetch: fetch2 }) {
  const res = await fetch2("about.json");
  if (res.ok) {
    return { props: res.json() };
  }
}
const About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { staffMembers, pageDetails } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  let topStaff = staffMembers.slice(0, 2);
  if ($$props.staffMembers === void 0 && $$bindings.staffMembers && staffMembers !== void 0)
    $$bindings.staffMembers(staffMembers);
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  $$result.css.add(css);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {
    default: () => `<section class="${"diagonal patterned"}"><div class="${"container"}"><p class="${"editor-link svelte-16zwu5m"}"><a href="${"cloudcannon:collections/content/staff-members/"}" class="${"btn"}"><strong>\u270E</strong>Manage Staff members</a></p>
			  <ul class="${"image-grid"}">${each(topStaff, (staff, index2) => `<li>${validate_component(AuthorCard, "AuthorCard").$$render($$result, { author: staff }, {}, {})}</li>`)}</ul></div></section>`
  })}`;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About,
  load: load$3
});
const PostDetails = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { post } = $$props;
  let date = post.date ? new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "";
  let postCategories = post.categories.slice(0, 4);
  let capitalise = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  if ($$props.post === void 0 && $$bindings.post && post !== void 0)
    $$bindings.post(post);
  return `<p class="${"post-details"}">${each(postCategories, (category, index2) => `<span class="${"blog-filter"}"><a href="${"/blog"}">${escape(capitalise(category))}</a>
		</span>`)}

	<span class="${"post-date"}">${escape(date)}</span></p>`;
});
const PostSummary = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { post } = $$props;
  if ($$props.post === void 0 && $$bindings.post && post !== void 0)
    $$bindings.post(post);
  return `<h3><a${add_attribute("href", `${siteData.baseurl}/blog/${post.slug}`, 0)}>${escape(post.title)}</a></h3>
${validate_component(PostDetails, "PostDetails").$$render($$result, { post }, {}, {})}
<div class="${"post-content"}"><p>${escape(post.excerpt_html)}</p>
	<p><a${add_attribute("href", `/blog/${post.slug}`, 0)}>Read More \u2192</a></p></div>`;
});
async function load$2({ page: page2, fetch: fetch2 }) {
  const { slug } = page2.params;
  const url2 = `/blog/${slug}.json`;
  const res = await fetch2(url2);
  if (res.ok) {
    return { props: res.json() };
  }
}
const U5Bslugu5D$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageDetails, author: author2, nextPost } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  if ($$props.author === void 0 && $$bindings.author && author2 !== void 0)
    $$bindings.author(author2);
  if ($$props.nextPost === void 0 && $$bindings.nextPost && nextPost !== void 0)
    $$bindings.nextPost(nextPost);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {
    default: () => `<section class="${"diagonal"}"><div class="${"blog-post text-container"}">${validate_component(PostDetails, "PostDetails").$$render($$result, { post: pageDetails }, {}, {})}
		<div class="${"post-content"}"><!-- HTML_TAG_START -->${pageDetails.content_html}<!-- HTML_TAG_END --></div></div></section>
<section class="${"diagonal patterned"}"><div class="${"container"}"><h2>Author</h2>
		<ul class="${"image-grid"}"><li>${validate_component(AuthorCard, "AuthorCard").$$render($$result, { author: author2 }, {}, {})}</li></ul></div></section>

${nextPost ? `<section class="${"diagonal alternate"}"><div class="${"text-container"}"><h2>Next post</h2>
		<div class="${"blog-post"}">${validate_component(PostSummary, "PostSummary").$$render($$result, { post: nextPost }, {}, {})}</div></div></section>` : ``}`
  })}`;
});
var _slug_$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bslugu5D$1,
  load: load$2
});
async function load$1({ fetch: fetch2 }) {
  const url2 = "blog.json";
  const res = await fetch2(url2);
  if (res.ok) {
    return { props: res.json() };
  }
}
const Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { posts, pageDetails } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
    $$bindings.posts(posts);
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {
    default: () => `<section class="${"diagonal"}"><div class="${"text-container"}"><p class="${"editor-link"}"><a href="${"cloudcannon:collections/content/posts"}" class="${"btn"}"><strong>\u270E</strong> Add Post</a></p>
			<ul class="${"blog-posts"}">${each(posts, (post, index2) => `<li class="${"blog-post"}">${validate_component(PostSummary, "PostSummary").$$render($$result, { post }, {}, {})}
				</li>`)}</ul></div></section>`
  })}`;
});
var blog = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Blog,
  load: load$1
});
async function load({ page: page2, fetch: fetch2 }) {
  const { slug } = page2.params;
  const url2 = `/${slug}.json`;
  const res = await fetch2(url2);
  if (res.ok) {
    return { props: res.json() };
  }
}
const U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pageDetails } = $$props;
  onDestroy(async () => {
    stopCloudCannonChanges();
  });
  if ($$props.pageDetails === void 0 && $$bindings.pageDetails && pageDetails !== void 0)
    $$bindings.pageDetails(pageDetails);
  return `${validate_component(Page, "Page").$$render($$result, { pageDetails }, {}, {})}`;
});
var _slug_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bslugu5D,
  load
});
export { init, render$2 as render };
