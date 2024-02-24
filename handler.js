/*! Telegram Bot Form Handler by Fineshop Design */
function handleTelegram(e = {}) {
	const t = {
			get title() {
				return document.title
			},
			get homepage() {
				return c.origin
			},
			get page() {
				this.homepage, c.pathname
			}
		},
		r = {
			stringify: e => `${"string"==typeof e?e:JSON.stringify(e)}`,
			escapeHTML: e => e.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/>/g, "&lt;"),
			objectToFormData(e) {
				const t = new FormData,
					r = (e, r, n) => {
						["string", "number", "boolean"].includes(typeof r) ? t.append(e, `${r}`) : r instanceof Blob && t.append(e, r, n)
					};
				return Object.keys(e).forEach((t => {
					const n = e[t];
					Array.isArray(n) ? n.forEach((e => r(t, e))) : r(t, n)
				})), t
			},
			getFormData(e) {
				const t = Object.defineProperties({}, {
						toArray: {
							value() {
								return Object.keys(this).map((e => this[e]))
							}
						},
						toValues: {
							value() {
								return Object.keys(this).reduce(((e, t) => (e[t] = this[t].value, e)), {})
							}
						}
					}),
					{
						elements: r
					} = e,
					n = Object.keys(r).map((e => r[e].name)).filter(((e, t, r) => r.indexOf(e) === t && e));
				for (let e = 0; e < n.length; e += 1) {
					const o = n[e],
						a = r[o],
						i = {
							element: a,
							name: o,
							type: a.type
						};
					switch (a.type) {
						case "checkbox":
							i.value = a.checked;
							break;
						case "file":
							i.value = Array.from(a.files), i.multiple = a.multiple;
							break;
						case "select-multiple":
							i.value = Array.from(a.options).filter((e => e.selected)).map((e => e.value));
							break;
						case "date":
						case "datetime-local":
							i.value = ["" === a.value ? null : a.value, isNaN(a.valueAsNumber) ? null : a.valueAsNumber];
							break;
						default:
							i.value = "" === a.value ? null : a.value
					}
					t[o] = i
				}
				return t
			}
		},
		n = {
			error(r, n) {
				if ("function" != typeof e.onError) throw r;
				e.onError(r, n, t)
			},
			validate: (r, n) => "function" != typeof e.validate || !0 === e.validate(r, n, t),
			submit(r, n, o) {
				"function" == typeof e.onSubmit && e.onSubmit(r, n, o, t)
			},
			sent(r, n, o) {
				"function" == typeof e.onSent && e.onSent(r, n, o, t)
			},
			notSent(r, n, o, a) {
				"function" == typeof e.onNotSent && e.onNotSent(r, n, o, a, t)
			},
			complete(r, n, o, a) {
				"function" == typeof e.onComplete && e.onComplete(r, n, o, a, t)
			},
			format(n, o, a) {
				if ("function" == typeof e.format) {
					const r = e.format(n, o, a, t);
					if ("string" == typeof r) return r
				}
				let i = "";
				return Object.keys(n).forEach((e => {
					const t = n[e];
					"file" !== t.type && (i && (i += "\n\n"), i += `<b>➪</b> <b>${r.escapeHTML(e)}</b> <b>➧</b> <code><i>${r.escapeHTML("string"==typeof t.value?t.value:JSON.stringify(t.value))}</i></code>`)
				})), i
			},
			caption(n, o, a, i) {
				if ("function" == typeof e.caption) {
					const r = e.caption(n, o, a, i, t);
					if ("string" == typeof r) return r
				}
				return `Type: ${r.escapeHTML(o.name)}\n\n<b>➪</b> Name: <b>➧</b> ${r.escapeHTML(n.name)}\n\n<b>⍟</b>: ${r.escapeHTML(n.type)}\n\n<b>➧</b> Modified: ${new Date(n.lastModified).toJSON()}`
			}
		},
		{
			form: o,
			token: a,
			chat: i,
			thread: s
		} = e,
		{
			location: c
		} = window,
		l = () => {};
	if (!o instanceof HTMLFormElement) return n.error(new TypeError("Field 'form' must be an HTMLFormElement")), l;
	if ("string" != typeof a) return n.error(new TypeError("Field 'token' must be of type string"), o), l;
	if ("string" != typeof i && "number" != typeof i) return n.error(new TypeError("Field 'chat' must be of type string or number"), o), l;
	if ("thread" in e && "string" != typeof s && "number" != typeof s) return n.error(new TypeError("Field 'thread' must be of type string or number"), o), l;
	const p = (e => ({
			get token() {
				return e
			},
			get url() {
				return `https://api.telegram.org/bot${this.token}`
			},
			async request(e, t) {
				const n = `${this.url}/${e}`;
				let o = t;
				t && (o.reply_markup || o.entities) && (o = {
					...t
				}, o.reply_markup && (o.reply_markup = r.stringify(o.reply_markup)), o.entities && (o.entities = r.stringify(o.entities)));
				const a = o ? r.objectToFormData(o) : void 0,
					i = new Request(n, {
						method: "POST",
						body: a,
						headers: {
							Accept: "application/json"
						}
					}),
					s = await fetch(i).then((e => {
						const t = e.headers.get("Content-Type");
						return t && t.startsWith("application/json") ? e.json() : null
					}));
				if (s) {
					if (s.ok) return s.result;
					if (s.description) throw new Error(s.description)
				}
				throw new Error("Response is invalid")
			},
			async sendMessage(e, t, r) {
				return this.request("sendMessage", {
					...r,
					chat_id: e,
					text: t
				})
			},
			async sendMediaGroup(e, t, n) {
				const o = {};
				return t && t.forEach(((e, r) => {
					if (e && e.media instanceof Blob) {
						const n = `file_attach_id_${r}`;
						o[n] = e.media, t[r] = {
							...e,
							media: `attach://${n}`
						}
					}
				})), this.request("sendMediaGroup", {
					...n,
					...o,
					chat_id: e,
					media: r.stringify(t)
				})
			}
		}))(a),
		u = e => {
			e.preventDefault();
			const a = r.getFormData(o);
			if (n.submit(e, a, o), n.validate(a, t, o)) {
				const e = a.toArray().filter((e => "file" === e.type)).reduce(((e, t) => (t.value.forEach((r => {
					const i = n.caption(r, t, a, o);
					e.push({
						type: "document",
						media: r,
						caption: i,
						parse_mode: "html"
					})
				})), e)), []);
				if (0 !== e.length) {
					e[e.length - 1].caption += `\n\n${n.format(a,e,o)}`, p.sendMediaGroup(i, e, {
						message_thread_id: s
					}).then((e => {
						try {
							n.sent(e, a, o), n.complete(!0, e, a, o)
						} catch (e) {
							n.error(e, o)
						}
					})).catch((e => {
						n.notSent(e, "bot", a, o), n.error(e, o), n.complete(!1, e, a, o)
					}))
				} else p.sendMessage(i, n.format(a, void 0, o), {
					message_thread_id: s,
					parse_mode: "html"
				}).then((e => {
					try {
						n.sent(e, a, o), n.complete(!0, e, a, o)
					} catch (e) {
						n.error(e, o)
					}
				})).catch((e => {
					n.notSent(e, "bot", a, o), n.error(e, o), n.complete(!1, e, a, o)
				}))
			} else {
				const e = new Error("Validation Failed");
				n.notSent(e, "validation", a, o), n.complete(!1, e, a, o)
			}
		};
	return o.addEventListener("submit", u), () => {
		o.removeEventListener("submit", u)
	}
}