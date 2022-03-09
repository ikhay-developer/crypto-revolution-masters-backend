
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
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
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const currentTab = writable("message");
    const lastTab = writable("message");
    const isNavBarMaximize = writable(true);
    const isLogin = writable(false);
    const addDataOption = writable({
        show: false,
        page: "none",
        input: null,
        output: null
    });

    /* src\components\navbar.svelte generated by Svelte v3.46.4 */
    const file$i = "src\\components\\navbar.svelte";

    function create_fragment$i(ctx) {
    	let nav;
    	let button0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let span0;
    	let t3;
    	let button2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let span1;
    	let t6;
    	let button3;
    	let img3;
    	let img3_src_value;
    	let t7;
    	let span2;
    	let t9;
    	let button4;
    	let img4;
    	let img4_src_value;
    	let t10;
    	let span3;
    	let t12;
    	let button5;
    	let img5;
    	let img5_src_value;
    	let t13;
    	let span4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			button0 = element("button");
    			img0 = element("img");
    			t0 = space();
    			button1 = element("button");
    			img1 = element("img");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "Message";
    			t3 = space();
    			button2 = element("button");
    			img2 = element("img");
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Favourite";
    			t6 = space();
    			button3 = element("button");
    			img3 = element("img");
    			t7 = space();
    			span2 = element("span");
    			span2.textContent = "Ads";
    			t9 = space();
    			button4 = element("button");
    			img4 = element("img");
    			t10 = space();
    			span3 = element("span");
    			span3.textContent = "Users";
    			t12 = space();
    			button5 = element("button");
    			img5 = element("img");
    			t13 = space();
    			span4 = element("span");
    			span4.textContent = "Settings";
    			if (!src_url_equal(img0.src, img0_src_value = "./img/justify.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "jus");
    			attr_dev(img0, "class", "svelte-1sbhbni");
    			add_location(img0, file$i, 35, 8, 1176);
    			attr_dev(button0, "class", "svelte-1sbhbni");
    			add_location(button0, file$i, 32, 4, 1061);
    			if (!src_url_equal(img1.src, img1_src_value = "./img/message.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "msg");
    			attr_dev(img1, "class", "svelte-1sbhbni");
    			add_location(img1, file$i, 45, 8, 1480);
    			attr_dev(span0, "class", "svelte-1sbhbni");
    			add_location(span0, file$i, 46, 8, 1529);
    			attr_dev(button1, "title", "Message");

    			set_style(button1, "border-color", /*$currentTab*/ ctx[2] == "message"
    			? "white"
    			: "transparent");

    			attr_dev(button1, "class", "svelte-1sbhbni");
    			add_location(button1, file$i, 37, 4, 1236);
    			if (!src_url_equal(img2.src, img2_src_value = "./img/favourite-coin.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "fav");
    			attr_dev(img2, "class", "svelte-1sbhbni");
    			add_location(img2, file$i, 56, 8, 1819);
    			attr_dev(span1, "class", "svelte-1sbhbni");
    			add_location(span1, file$i, 57, 8, 1875);
    			attr_dev(button2, "title", "Favourite");

    			set_style(button2, "border-color", /*$currentTab*/ ctx[2] == "favourite"
    			? "white"
    			: "transparent");

    			attr_dev(button2, "class", "svelte-1sbhbni");
    			add_location(button2, file$i, 48, 4, 1570);
    			if (!src_url_equal(img3.src, img3_src_value = "./img/ads.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "ads");
    			attr_dev(img3, "class", "svelte-1sbhbni");
    			add_location(img3, file$i, 67, 8, 2149);
    			attr_dev(span2, "class", "svelte-1sbhbni");
    			add_location(span2, file$i, 68, 8, 2194);
    			attr_dev(button3, "title", "Ads");

    			set_style(button3, "border-color", /*$currentTab*/ ctx[2] == "ads"
    			? "white"
    			: "transparent");

    			attr_dev(button3, "class", "svelte-1sbhbni");
    			add_location(button3, file$i, 59, 4, 1918);
    			if (!src_url_equal(img4.src, img4_src_value = "./img/users.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "urs");
    			attr_dev(img4, "class", "svelte-1sbhbni");
    			add_location(img4, file$i, 78, 8, 2468);
    			attr_dev(span3, "class", "svelte-1sbhbni");
    			add_location(span3, file$i, 79, 8, 2515);
    			attr_dev(button4, "title", "Users");

    			set_style(button4, "border-color", /*$currentTab*/ ctx[2] == "users"
    			? "white"
    			: "transparent");

    			attr_dev(button4, "class", "svelte-1sbhbni");
    			add_location(button4, file$i, 70, 4, 2231);
    			if (!src_url_equal(img5.src, img5_src_value = "./img/settings.svg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "stgs");
    			attr_dev(img5, "class", "svelte-1sbhbni");
    			add_location(img5, file$i, 89, 8, 2800);
    			attr_dev(span4, "class", "svelte-1sbhbni");
    			add_location(span4, file$i, 90, 8, 2851);
    			attr_dev(button5, "title", "Settings");

    			set_style(button5, "border-color", /*$currentTab*/ ctx[2] == "settings"
    			? "white"
    			: "transparent");

    			attr_dev(button5, "class", "svelte-1sbhbni");
    			add_location(button5, file$i, 81, 4, 2554);
    			attr_dev(nav, "class", "svelte-1sbhbni");
    			add_location(nav, file$i, 31, 0, 1031);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, button0);
    			append_dev(button0, img0);
    			append_dev(nav, t0);
    			append_dev(nav, button1);
    			append_dev(button1, img1);
    			append_dev(button1, t1);
    			append_dev(button1, span0);
    			append_dev(nav, t3);
    			append_dev(nav, button2);
    			append_dev(button2, img2);
    			append_dev(button2, t4);
    			append_dev(button2, span1);
    			append_dev(nav, t6);
    			append_dev(nav, button3);
    			append_dev(button3, img3);
    			append_dev(button3, t7);
    			append_dev(button3, span2);
    			append_dev(nav, t9);
    			append_dev(nav, button4);
    			append_dev(button4, img4);
    			append_dev(button4, t10);
    			append_dev(button4, span3);
    			append_dev(nav, t12);
    			append_dev(nav, button5);
    			append_dev(button5, img5);
    			append_dev(button5, t13);
    			append_dev(button5, span4);
    			/*nav_binding*/ ctx[11](nav);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[8], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[9], false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$currentTab*/ 4) {
    				set_style(button1, "border-color", /*$currentTab*/ ctx[2] == "message"
    				? "white"
    				: "transparent");
    			}

    			if (dirty & /*$currentTab*/ 4) {
    				set_style(button2, "border-color", /*$currentTab*/ ctx[2] == "favourite"
    				? "white"
    				: "transparent");
    			}

    			if (dirty & /*$currentTab*/ 4) {
    				set_style(button3, "border-color", /*$currentTab*/ ctx[2] == "ads"
    				? "white"
    				: "transparent");
    			}

    			if (dirty & /*$currentTab*/ 4) {
    				set_style(button4, "border-color", /*$currentTab*/ ctx[2] == "users"
    				? "white"
    				: "transparent");
    			}

    			if (dirty & /*$currentTab*/ 4) {
    				set_style(button5, "border-color", /*$currentTab*/ ctx[2] == "settings"
    				? "white"
    				: "transparent");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			/*nav_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let NavbarToggle;
    	let $isNavBarMaximize;
    	let $currentTab;
    	let $lastTab;
    	validate_store(isNavBarMaximize, 'isNavBarMaximize');
    	component_subscribe($$self, isNavBarMaximize, $$value => $$invalidate(4, $isNavBarMaximize = $$value));
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(2, $currentTab = $$value));
    	validate_store(lastTab, 'lastTab');
    	component_subscribe($$self, lastTab, $$value => $$invalidate(3, $lastTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let Navbar;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => $$invalidate(1, NavbarToggle = $currentTab == "favourite" ? true : !NavbarToggle);

    	const click_handler_1 = _ => {
    		set_store_value(lastTab, $lastTab = $currentTab, $lastTab);
    		set_store_value(currentTab, $currentTab = "message", $currentTab);
    	};

    	const click_handler_2 = _ => {
    		set_store_value(lastTab, $lastTab = $currentTab, $lastTab);
    		set_store_value(currentTab, $currentTab = "favourite", $currentTab);
    	};

    	const click_handler_3 = _ => {
    		set_store_value(lastTab, $lastTab = $currentTab, $lastTab);
    		set_store_value(currentTab, $currentTab = "ads", $currentTab);
    	};

    	const click_handler_4 = _ => {
    		set_store_value(lastTab, $lastTab = $currentTab, $lastTab);
    		set_store_value(currentTab, $currentTab = "users", $currentTab);
    	};

    	const click_handler_5 = _ => {
    		set_store_value(lastTab, $lastTab = $currentTab, $lastTab);
    		set_store_value(currentTab, $currentTab = "settings", $currentTab);
    	};

    	function nav_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			Navbar = $$value;
    			$$invalidate(0, Navbar);
    		});
    	}

    	$$self.$capture_state = () => ({
    		currentTab,
    		isNavBarMaximize,
    		lastTab,
    		Navbar,
    		NavbarToggle,
    		$isNavBarMaximize,
    		$currentTab,
    		$lastTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('Navbar' in $$props) $$invalidate(0, Navbar = $$props.Navbar);
    		if ('NavbarToggle' in $$props) $$invalidate(1, NavbarToggle = $$props.NavbarToggle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*Navbar, NavbarToggle*/ 3) {
    			{
    				if (Navbar != undefined) {
    					if (NavbarToggle) {
    						set_store_value(isNavBarMaximize, $isNavBarMaximize = false, $isNavBarMaximize);
    					} else {
    						set_store_value(isNavBarMaximize, $isNavBarMaximize = true, $isNavBarMaximize);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*Navbar, $isNavBarMaximize*/ 17) {
    			{
    				if (Navbar != undefined) {
    					if (!$isNavBarMaximize) {
    						Navbar.style.setProperty("--not-xs-span-display", "none");
    						Navbar.style.setProperty("--sm-screen-width", "60px");
    						Navbar.style.setProperty("--md-screen-width", "60px");
    						Navbar.style.setProperty("--lg-screen-width", "60px");
    					} else if ($isNavBarMaximize) {
    						Navbar.style.setProperty("--not-xs-span-display", "block");
    						Navbar.style.setProperty("--sm-screen-width", "200px");
    						Navbar.style.setProperty("--md-screen-width", "240px");
    						Navbar.style.setProperty("--lg-screen-width", "280px");
    					}
    				}
    			}
    		}
    	};

    	$$invalidate(1, NavbarToggle = false);

    	return [
    		Navbar,
    		NavbarToggle,
    		$currentTab,
    		$lastTab,
    		$isNavBarMaximize,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		nav_binding
    	];
    }

    class Navbar_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar_1",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* node_modules\svelte-loading-spinners\dist\ts\Circle.svelte generated by Svelte v3.46.4 */

    const file$h = "node_modules\\svelte-loading-spinners\\dist\\ts\\Circle.svelte";

    function create_fragment$h(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "circle svelte-14upwad");
    			set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			set_style(div, "--color", /*color*/ ctx[0]);
    			set_style(div, "--duration", /*duration*/ ctx[2]);
    			add_location(div, file$h, 27, 0, 633);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size, unit*/ 10) {
    				set_style(div, "--size", /*size*/ ctx[3] + /*unit*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div, "--color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*duration*/ 4) {
    				set_style(div, "--duration", /*duration*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Circle', slots, []);
    	let { color = "#FF3E00" } = $$props;
    	let { unit = "px" } = $$props;
    	let { duration = "0.75s" } = $$props;
    	let { size = "60" } = $$props;
    	const writable_props = ['color', 'unit', 'duration', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Circle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ color, unit, duration, size });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, unit, duration, size];
    }

    class Circle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { color: 0, unit: 1, duration: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Circle",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get color() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Circle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Circle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\loginpage.svelte generated by Svelte v3.46.4 */
    const file$g = "src\\components\\loginpage.svelte";

    // (53:8) {:else}
    function create_else_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No internet";
    			set_style(p, "color", "#d32f2f");
    			attr_dev(p, "class", "svelte-1mapel2");
    			add_location(p, file$g, 53, 12, 1766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(53:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:8) {#if onLine}
    function create_if_block_4$5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Login";
    			attr_dev(p, "class", "svelte-1mapel2");
    			add_location(p, file$g, 51, 12, 1723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$5.name,
    		type: "if",
    		source: "(51:8) {#if onLine}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {:else}
    function create_else_block_1$2(ctx) {
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			attr_dev(input0, "class", "svelte-1mapel2");
    			add_location(input0, file$g, 69, 12, 2758);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-1mapel2");
    			add_location(input1, file$g, 70, 12, 2836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*username*/ ctx[0]);
    			insert_dev(target, t, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*password*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_3*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_input_handler_3*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(69:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (65:47) 
    function create_if_block_3$7(ctx) {
    	let input0;
    	let t0;
    	let span;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Wrong username";
    			t2 = space();
    			input1 = element("input");
    			set_style(input0, "border-color", "red");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			attr_dev(input0, "class", "svelte-1mapel2");
    			add_location(input0, file$g, 65, 12, 2513);
    			attr_dev(span, "class", "svelte-1mapel2");
    			add_location(span, file$g, 66, 12, 2618);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-1mapel2");
    			add_location(input1, file$g, 67, 12, 2659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*username*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*password*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_2*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler_2*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$7.name,
    		type: "if",
    		source: "(65:47) ",
    		ctx
    	});

    	return block;
    }

    // (61:47) 
    function create_if_block_2$7(ctx) {
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Wrong pasword";
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			attr_dev(input0, "class", "svelte-1mapel2");
    			add_location(input0, file$g, 61, 12, 2237);
    			set_style(input1, "border-color", "red");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-1mapel2");
    			add_location(input1, file$g, 62, 12, 2315);
    			attr_dev(span, "class", "svelte-1mapel2");
    			add_location(span, file$g, 63, 12, 2424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*username*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*password*/ ctx[1]);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(61:47) ",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#if errorMsg == "wrong username and password"}
    function create_if_block_1$8(ctx) {
    	let input0;
    	let t0;
    	let span0;
    	let t2;
    	let input1;
    	let t3;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Wrong username";
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Wrong pasword";
    			set_style(input0, "border-color", "red");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			attr_dev(input0, "class", "svelte-1mapel2");
    			add_location(input0, file$g, 56, 12, 1893);
    			attr_dev(span0, "class", "svelte-1mapel2");
    			add_location(span0, file$g, 57, 12, 1998);
    			set_style(input1, "border-color", "red");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-1mapel2");
    			add_location(input1, file$g, 58, 12, 2039);
    			attr_dev(span1, "class", "svelte-1mapel2");
    			add_location(span1, file$g, 59, 12, 2148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*username*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*password*/ ctx[1]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(56:8) {#if errorMsg == \\\"wrong username and password\\\"}",
    		ctx
    	});

    	return block;
    }

    // (76:12) {:else}
    function create_else_block$8(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "white", size: 18, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(76:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:12) {#if !isLoading}
    function create_if_block$8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Continue");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(74:12) {#if !isLoading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let t0;
    	let main;
    	let div;
    	let t1;
    	let t2;
    	let button;
    	let current_block_type_index;
    	let if_block2;
    	let button_disabled_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*onLine*/ ctx[3]) return create_if_block_4$5;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*errorMsg*/ ctx[2] == "wrong username and password") return create_if_block_1$8;
    		if (/*errorMsg*/ ctx[2] == "wrong password") return create_if_block_2$7;
    		if (/*errorMsg*/ ctx[2] == "wrong username") return create_if_block_3$7;
    		return create_else_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	const if_block_creators = [create_if_block$8, create_else_block$8];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*isLoading*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			div = element("div");
    			if_block0.c();
    			t1 = space();
    			if_block1.c();
    			t2 = space();
    			button = element("button");
    			if_block2.c();
    			document.title = "Login";
    			button.disabled = button_disabled_value = !/*onLine*/ ctx[3];
    			attr_dev(button, "class", "svelte-1mapel2");
    			add_location(button, file$g, 72, 8, 2929);
    			attr_dev(div, "class", "svelte-1mapel2");
    			add_location(div, file$g, 49, 4, 1682);
    			attr_dev(main, "class", "svelte-1mapel2");
    			add_location(main, file$g, 48, 0, 1670);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if_block0.m(div, null);
    			append_dev(div, t1);
    			if_block1.m(div, null);
    			append_dev(div, t2);
    			append_dev(div, button);
    			if_blocks[current_block_type_index].m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*logIn*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t1);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t2);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(button, null);
    			}

    			if (!current || dirty & /*onLine*/ 8 && button_disabled_value !== (button_disabled_value = !/*onLine*/ ctx[3])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if_block0.d();
    			if_block1.d();
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $isLogin;
    	validate_store(isLogin, 'isLogin');
    	component_subscribe($$self, isLogin, $$value => $$invalidate(14, $isLogin = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loginpage', slots, []);
    	let username = String();
    	let password = String();
    	let errorMsg = "none";
    	let onLine = false;
    	let isLoading = false;

    	const checkOnlineState = () => {
    		$$invalidate(3, onLine = window.navigator.onLine);
    		requestAnimationFrame(checkOnlineState);
    	};

    	requestAnimationFrame(checkOnlineState);

    	const logIn = () => {
    		if (onLine) {
    			$$invalidate(4, isLoading = true);

    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/auth", {
    				method: "GET",
    				headers: {
    					"Accept": "*/*",
    					"Content-Type": "application/json"
    				}
    			}).then(function (response) {
    				return response.json();
    			}).then(function (data) {
    				if (data.state == "success") {
    					$$invalidate(4, isLoading = false);

    					if (data.data.username != username && data.data.password != password) {
    						$$invalidate(2, errorMsg = "wrong username and password");
    					} else if (data.data.username != username && data.data.password == password) {
    						$$invalidate(2, errorMsg = "wrong username");
    					} else if (data.data.username == username && data.data.password != password) {
    						$$invalidate(2, errorMsg = "wrong password");
    					} else {
    						$$invalidate(2, errorMsg = "none");
    						set_store_value(isLogin, $isLogin = true, $isLogin);
    					}
    				}
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loginpage> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	function input0_input_handler_1() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler_1() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	function input0_input_handler_2() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler_2() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	function input0_input_handler_3() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler_3() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		isLogin,
    		Circle,
    		username,
    		password,
    		errorMsg,
    		onLine,
    		isLoading,
    		checkOnlineState,
    		logIn,
    		$isLogin
    	});

    	$$self.$inject_state = $$props => {
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    		if ('errorMsg' in $$props) $$invalidate(2, errorMsg = $$props.errorMsg);
    		if ('onLine' in $$props) $$invalidate(3, onLine = $$props.onLine);
    		if ('isLoading' in $$props) $$invalidate(4, isLoading = $$props.isLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		username,
    		password,
    		errorMsg,
    		onLine,
    		isLoading,
    		logIn,
    		input0_input_handler,
    		input1_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input0_input_handler_2,
    		input1_input_handler_2,
    		input0_input_handler_3,
    		input1_input_handler_3
    	];
    }

    class Loginpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loginpage",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\utils\noConnectionPage.svelte generated by Svelte v3.46.4 */

    const file$f = "src\\utils\\noConnectionPage.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "No connection";
    			if (!src_url_equal(img.src, img_src_value = "./img/globe.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "no connection");
    			attr_dev(img, "class", "svelte-1sf191f");
    			add_location(img, file$f, 1, 4, 11);
    			attr_dev(span, "class", "svelte-1sf191f");
    			add_location(span, file$f, 2, 4, 64);
    			attr_dev(div, "class", "svelte-1sf191f");
    			add_location(div, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NoConnectionPage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NoConnectionPage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NoConnectionPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoConnectionPage",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\utils\tabwapper.svelte generated by Svelte v3.46.4 */
    const file$e = "src\\utils\\tabwapper.svelte";

    function create_fragment$e(ctx) {
    	let main_1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			main_1 = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(main_1, "class", "svelte-4fu8wh");
    			set_style(main_1, "display", /*show*/ ctx[0] ? "block" : "none", false);
    			add_location(main_1, file$e, 65, 4, 2757);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main_1, anchor);

    			if (default_slot) {
    				default_slot.m(main_1, null);
    			}

    			/*main_1_binding*/ ctx[5](main_1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*show*/ 1) {
    				set_style(main_1, "display", /*show*/ ctx[0] ? "block" : "none", false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main_1);
    			if (default_slot) default_slot.d(detaching);
    			/*main_1_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $isNavBarMaximize;
    	validate_store(isNavBarMaximize, 'isNavBarMaximize');
    	component_subscribe($$self, isNavBarMaximize, $$value => $$invalidate(2, $isNavBarMaximize = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabwapper', slots, ['default']);
    	let { show = false } = $$props;
    	let main;

    	onMount(() => {
    		if (main != undefined) {
    			let screenType = getComputedStyle(main).getPropertyValue("--screen-type");

    			if (screenType != "xs") {
    				if ($isNavBarMaximize) {
    					if (screenType == "sm") main.style.setProperty("--not-xs-screen-width", "200px"); else if (screenType == "md") main.style.setProperty("--not-xs-screen-width", "240px"); else if (screenType == "lg") main.style.setProperty("--not-xs-screen-width", "280px"); else if (screenType == "xl") main.style.setProperty("--not-xs-screen-width", "280px");
    				} else if (!$isNavBarMaximize) {
    					main.style.setProperty("--not-xs-screen-width", "60px");
    				}
    			}
    		}
    	});

    	window.onresize = () => {
    		if (main != undefined) {
    			let screenType = getComputedStyle(main).getPropertyValue("--screen-type");

    			if (screenType != "xs") {
    				if ($isNavBarMaximize) {
    					if (screenType == "sm") main.style.setProperty("--not-xs-screen-width", "200px"); else if (screenType == "md") main.style.setProperty("--not-xs-screen-width", "240px"); else if (screenType == "lg") main.style.setProperty("--not-xs-screen-width", "280px"); else if (screenType == "xl") main.style.setProperty("--not-xs-screen-width", "280px");
    				} else if (!$isNavBarMaximize) {
    					main.style.setProperty("--not-xs-screen-width", "60px");
    				}
    			}
    		}
    	};

    	const writable_props = ['show'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabwapper> was created with unknown prop '${key}'`);
    	});

    	function main_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			main = $$value;
    			$$invalidate(1, main);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		isNavBarMaximize,
    		onMount,
    		show,
    		main,
    		$isNavBarMaximize
    	});

    	$$self.$inject_state = $$props => {
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    		if ('main' in $$props) $$invalidate(1, main = $$props.main);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*main, $isNavBarMaximize*/ 6) {
    			{
    				if (main != undefined) {
    					let screenType = getComputedStyle(main).getPropertyValue("--screen-type");

    					if (screenType != "xs") {
    						if ($isNavBarMaximize) {
    							if (screenType == "sm") main.style.setProperty("--not-xs-screen-width", "200px"); else if (screenType == "md") main.style.setProperty("--not-xs-screen-width", "240px"); else if (screenType == "lg") main.style.setProperty("--not-xs-screen-width", "280px"); else if (screenType == "xl") main.style.setProperty("--not-xs-screen-width", "280px");
    						} else if (!$isNavBarMaximize) {
    							main.style.setProperty("--not-xs-screen-width", "60px");
    						}
    					}
    				}
    			}
    		}
    	};

    	return [show, main, $isNavBarMaximize, $$scope, slots, main_1_binding];
    }

    class Tabwapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { show: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabwapper",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get show() {
    		throw new Error("<Tabwapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Tabwapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\tabs\settings.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1$4 } = globals;
    const file$d = "src\\components\\tabs\\settings.svelte";

    // (144:62) 
    function create_if_block_5(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_6, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*hasResponseError*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "loading-spinner svelte-1765ux9");
    			add_location(div, file$d, 144, 12, 5610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(144:62) ",
    		ctx
    	});

    	return block;
    }

    // (115:8) {#if hasLoadedData && $currentTab == "settings"}
    function create_if_block$7(ctx) {
    	let div1;
    	let header;
    	let span;
    	let t1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let main;
    	let p0;
    	let t4;
    	let input0;
    	let input0_id_value;
    	let t5;
    	let p1;
    	let t7;
    	let input1;
    	let input1_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$7, create_if_block_2$6, create_if_block_3$6, create_if_block_4$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*isEditingtAuthData*/ ctx[6] == 0 && /*isAuthDataChange*/ ctx[7]) return 0;
    		if (/*isEditingtAuthData*/ ctx[6] == 1) return 1;
    		if (/*isEditingtAuthData*/ ctx[6] == 3) return 2;
    		if (/*isEditingtAuthData*/ ctx[6] == 4) return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			span = element("span");
    			span.textContent = "General";
    			t1 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			main = element("main");
    			p0 = element("p");
    			p0.textContent = "Username";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Password";
    			t7 = space();
    			input1 = element("input");
    			attr_dev(span, "id", "title");
    			attr_dev(span, "class", "svelte-1765ux9");
    			add_location(span, file$d, 117, 20, 3863);
    			attr_dev(div0, "class", "svelte-1765ux9");

    			set_style(
    				div0,
    				"width",
    				/*isEditingtAuthData*/ ctx[6] == 0
    				? "128px"
    				: /*isEditingtAuthData*/ ctx[6] == 1 ? "38px" : "30px",
    				false
    			);

    			add_location(div0, file$d, 118, 20, 3916);
    			attr_dev(header, "class", "svelte-1765ux9");
    			add_location(header, file$d, 116, 16, 3833);
    			attr_dev(p0, "class", "svelte-1765ux9");
    			add_location(p0, file$d, 137, 20, 5215);
    			attr_dev(input0, "id", input0_id_value = /*username*/ ctx[2] == String() ? "empty-input" : "");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-1765ux9");
    			add_location(input0, file$d, 138, 20, 5252);
    			attr_dev(p1, "class", "svelte-1765ux9");
    			add_location(p1, file$d, 139, 20, 5362);
    			attr_dev(input1, "id", input1_id_value = /*password*/ ctx[3] == String() ? "empty-input" : "");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-1765ux9");
    			add_location(input1, file$d, 140, 20, 5399);
    			attr_dev(main, "class", "form-data svelte-1765ux9");
    			add_location(main, file$d, 136, 16, 5169);
    			attr_dev(div1, "class", "body svelte-1765ux9");
    			add_location(div1, file$d, 115, 12, 3797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, span);
    			append_dev(header, t1);
    			append_dev(header, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, main);
    			append_dev(main, p0);
    			append_dev(main, t4);
    			append_dev(main, input0);
    			set_input_value(input0, /*username*/ ctx[2]);
    			append_dev(main, t5);
    			append_dev(main, p1);
    			append_dev(main, t7);
    			append_dev(main, input1);
    			set_input_value(input1, /*password*/ ctx[3]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty & /*isEditingtAuthData*/ 64) {
    				set_style(
    					div0,
    					"width",
    					/*isEditingtAuthData*/ ctx[6] == 0
    					? "128px"
    					: /*isEditingtAuthData*/ ctx[6] == 1 ? "38px" : "30px",
    					false
    				);
    			}

    			if (!current || dirty & /*username*/ 4 && input0_id_value !== (input0_id_value = /*username*/ ctx[2] == String() ? "empty-input" : "")) {
    				attr_dev(input0, "id", input0_id_value);
    			}

    			if (dirty & /*username*/ 4 && input0.value !== /*username*/ ctx[2]) {
    				set_input_value(input0, /*username*/ ctx[2]);
    			}

    			if (!current || dirty & /*password*/ 8 && input1_id_value !== (input1_id_value = /*password*/ ctx[3] == String() ? "empty-input" : "")) {
    				attr_dev(input1, "id", input1_id_value);
    			}

    			if (dirty & /*password*/ 8 && input1.value !== /*password*/ ctx[3]) {
    				set_input_value(input1, /*password*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(115:8) {#if hasLoadedData && $currentTab == \\\"settings\\\"}",
    		ctx
    	});

    	return block;
    }

    // (148:16) {:else}
    function create_else_block$7(ctx) {
    	let noconnectionpage;
    	let current;
    	noconnectionpage = new NoConnectionPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(noconnectionpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noconnectionpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noconnectionpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noconnectionpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noconnectionpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(148:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (146:16) {#if !hasResponseError}
    function create_if_block_6(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 90, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(146:16) {#if !hasResponseError}",
    		ctx
    	});

    	return block;
    }

    // (132:58) 
    function create_if_block_4$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./img/error-mark.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "25px");
    			attr_dev(img, "width", "25px");
    			attr_dev(img, "alt", "");
    			add_location(img, file$d, 132, 28, 4999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(132:58) ",
    		ctx
    	});

    	return block;
    }

    // (130:58) 
    function create_if_block_3$6(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./img/success-mark.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "25px");
    			attr_dev(img, "width", "25px");
    			attr_dev(img, "alt", "");
    			add_location(img, file$d, 130, 28, 4841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(130:58) ",
    		ctx
    	});

    	return block;
    }

    // (128:58) 
    function create_if_block_2$6(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 28, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(128:58) ",
    		ctx
    	});

    	return block;
    }

    // (120:24) {#if isEditingtAuthData == 0 && isAuthDataChange}
    function create_if_block_1$7(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t2;
    	let button1_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t1 = space();
    			button1 = element("button");
    			t2 = text("Save");
    			attr_dev(button0, "id", "cancel-btn");
    			attr_dev(button0, "class", "svelte-1765ux9");
    			add_location(button0, file$d, 120, 28, 4117);
    			attr_dev(button1, "id", "save-btn");

    			button1.disabled = button1_disabled_value = /*username*/ ctx[2] == String() || /*password*/ ctx[3] == String()
    			? true
    			: false;

    			attr_dev(button1, "class", "svelte-1765ux9");
    			add_location(button1, file$d, 126, 28, 4456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username, password*/ 12 && button1_disabled_value !== (button1_disabled_value = /*username*/ ctx[2] == String() || /*password*/ ctx[3] == String()
    			? true
    			: false)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(120:24) {#if isEditingtAuthData == 0 && isAuthDataChange}",
    		ctx
    	});

    	return block;
    }

    // (113:0) <Tabwapper show={$currentTab == "settings"}>
    function create_default_slot$3(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$7, create_if_block_5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasLoadedData*/ ctx[0] && /*$currentTab*/ ctx[4] == "settings") return 0;
    		if (!/*hasLoadedData*/ ctx[0] && /*$currentTab*/ ctx[4] == "settings") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "svelte-1765ux9");
    			add_location(main, file$d, 113, 4, 3719);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(113:0) <Tabwapper show={$currentTab == \\\"settings\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let tabwapper;
    	let current;

    	tabwapper = new Tabwapper({
    			props: {
    				show: /*$currentTab*/ ctx[4] == "settings",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabwapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$4("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabwapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabwapper_changes = {};
    			if (dirty & /*$currentTab*/ 16) tabwapper_changes.show = /*$currentTab*/ ctx[4] == "settings";

    			if (dirty & /*$$scope, password, username, isEditingtAuthData, hasLoadedData, authData, isAuthDataChange, $currentTab, hasResponseError*/ 65791) {
    				tabwapper_changes.$$scope = { dirty, ctx };
    			}

    			tabwapper.$set(tabwapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabwapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabwapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabwapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let isAuthDataChange;
    	let $currentTab;
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(4, $currentTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	let hasResponseError = false;
    	let hasLoadedData = false;
    	let authData;
    	let username = String();
    	let password = String();
    	let isLoading = false;
    	let isEditingtAuthData = 0;

    	const loadData = () => {
    		if ($currentTab == "settings" && !hasLoadedData) {
    			isLoading = true;

    			let headersList = {
    				"Accept": "*/*",
    				"User-Agent": "Thunder Client (https://www.thunderclient.com)",
    				"Content-Type": "application/json"
    			};

    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/auth", { method: "GET", headers: headersList }).then(response => {
    				return response.json();
    			}).then(data => {
    				if (data.state == "success") {
    					$$invalidate(1, authData = data.data);
    					$$invalidate(0, hasLoadedData = true);
    					$$invalidate(5, hasResponseError = false);
    					$$invalidate(2, username = authData.username);
    					$$invalidate(3, password = authData.password);
    					isLoading = false;
    				} else {
    					throw new Error();
    				}
    			}).catch(_ => {
    				isLoading = false;
    				$$invalidate(5, hasResponseError = true);
    				$$invalidate(0, hasLoadedData = false);
    			});
    		} else {
    			$$invalidate(0, hasLoadedData = false);
    			$$invalidate(5, hasResponseError = false);
    			isLoading = false;
    		}
    	};

    	const loadDataWhenOnline = () => {
    		if (!hasLoadedData && window.navigator.onLine && hasResponseError) $$invalidate(5, hasResponseError = false);
    		if ($currentTab == "settings" && !isLoading && window.navigator.onLine && !hasLoadedData) loadData();
    		requestAnimationFrame(loadDataWhenOnline);
    	};

    	const saveNewAuthData = (newUsername, newPassword) => {
    		$$invalidate(6, isEditingtAuthData = 1);

    		let headersList = {
    			"Accept": "*/*",
    			"Content-Type": "application/json"
    		};

    		let bodyContent = JSON.stringify({
    			"username": newUsername,
    			"password": newPassword
    		});

    		fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/auth", {
    			method: "POST",
    			body: bodyContent,
    			headers: headersList
    		}).then(function (response) {
    			return response.json();
    		}).then(function (data) {
    			if (data.state == "success") {
    				$$invalidate(2, username = data.data["username"]);
    				$$invalidate(3, password = data.data["password"]);
    				$$invalidate(1, authData = data.data);
    				$$invalidate(6, isEditingtAuthData = 3);

    				setTimeout(
    					_ => {
    						$$invalidate(6, isEditingtAuthData = 0);
    					},
    					2000
    				);
    			} else {
    				throw new Error();
    			}
    		}).catch(_ => {
    			$$invalidate(6, isEditingtAuthData = 4);

    			setTimeout(
    				_ => {
    					$$invalidate(6, isEditingtAuthData = 0);
    				},
    				2000
    			);
    		});
    	};

    	requestAnimationFrame(loadDataWhenOnline);
    	onMount(loadData);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => {
    		if (hasLoadedData) {
    			$$invalidate(2, username = authData.username);
    			$$invalidate(3, password = authData.password);
    		}
    	};

    	const click_handler_1 = _ => saveNewAuthData(username, password);

    	function input0_input_handler() {
    		username = this.value;
    		($$invalidate(2, username), $$invalidate(4, $currentTab));
    	}

    	function input1_input_handler() {
    		password = this.value;
    		($$invalidate(3, password), $$invalidate(4, $currentTab));
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Circle,
    		currentTab,
    		NoConnectionPage,
    		Tabwapper,
    		hasResponseError,
    		hasLoadedData,
    		authData,
    		username,
    		password,
    		isLoading,
    		isEditingtAuthData,
    		loadData,
    		loadDataWhenOnline,
    		saveNewAuthData,
    		isAuthDataChange,
    		$currentTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('hasResponseError' in $$props) $$invalidate(5, hasResponseError = $$props.hasResponseError);
    		if ('hasLoadedData' in $$props) $$invalidate(0, hasLoadedData = $$props.hasLoadedData);
    		if ('authData' in $$props) $$invalidate(1, authData = $$props.authData);
    		if ('username' in $$props) $$invalidate(2, username = $$props.username);
    		if ('password' in $$props) $$invalidate(3, password = $$props.password);
    		if ('isLoading' in $$props) isLoading = $$props.isLoading;
    		if ('isEditingtAuthData' in $$props) $$invalidate(6, isEditingtAuthData = $$props.isEditingtAuthData);
    		if ('isAuthDataChange' in $$props) $$invalidate(7, isAuthDataChange = $$props.isAuthDataChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentTab*/ 16) {
    			{
    				if ($currentTab != "settings") {
    					$$invalidate(5, hasResponseError = false);
    					$$invalidate(0, hasLoadedData = false);
    					$$invalidate(1, authData.password = String(), authData);
    					$$invalidate(1, authData.username = String(), authData);
    					$$invalidate(2, username = String());
    					$$invalidate(3, password = String());
    					isLoading = false;
    					$$invalidate(6, isEditingtAuthData = 0);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*hasLoadedData, username, authData, password*/ 15) {
    			$$invalidate(7, isAuthDataChange = hasLoadedData
    			? username != authData.username || password != authData.password
    			: false);
    		}
    	};

    	{
    		loadData();
    	}

    	return [
    		hasLoadedData,
    		authData,
    		username,
    		password,
    		$currentTab,
    		hasResponseError,
    		isEditingtAuthData,
    		isAuthDataChange,
    		saveNewAuthData,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\utils\searchbar.svelte generated by Svelte v3.46.4 */
    const file$c = "src\\utils\\searchbar.svelte";

    function create_fragment$c(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			input = element("input");
    			if (!src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "search");
    			attr_dev(img, "class", "svelte-109ms9");
    			add_location(img, file$c, 18, 8, 572);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			attr_dev(input, "class", "svelte-109ms9");
    			add_location(input, file$c, 27, 8, 809);
    			attr_dev(div0, "class", "search-bar svelte-109ms9");
    			add_location(div0, file$c, 17, 4, 538);
    			attr_dev(div1, "class", "search-bar-container svelte-109ms9");
    			add_location(div1, file$c, 16, 0, 476);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t);
    			append_dev(div0, input);
    			set_input_value(input, /*searchValue*/ ctx[1]);
    			/*div1_binding*/ ctx[7](div1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*imgSrc*/ 8 && !src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			}

    			if (dirty & /*searchValue*/ 2 && input.value !== /*searchValue*/ ctx[1]) {
    				set_input_value(input, /*searchValue*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let imgSrc;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Searchbar', slots, []);
    	let { placeholder = "search" } = $$props;
    	let { searchWidth = "300px" } = $$props;
    	let searchBar = null;
    	const dispatcher = createEventDispatcher();

    	onMount(() => {
    		if (searchBar != null) $$invalidate(2, searchBar.style.width = searchWidth, searchBar);
    	});

    	let searchValue = String();
    	const writable_props = ['placeholder', 'searchWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Searchbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => {
    		if (searchValue != String()) {
    			$$invalidate(1, searchValue = String());
    		}
    	};

    	function input_input_handler() {
    		searchValue = this.value;
    		$$invalidate(1, searchValue);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			searchBar = $$value;
    			$$invalidate(2, searchBar);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('placeholder' in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ('searchWidth' in $$props) $$invalidate(4, searchWidth = $$props.searchWidth);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		placeholder,
    		searchWidth,
    		searchBar,
    		dispatcher,
    		searchValue,
    		imgSrc
    	});

    	$$self.$inject_state = $$props => {
    		if ('placeholder' in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ('searchWidth' in $$props) $$invalidate(4, searchWidth = $$props.searchWidth);
    		if ('searchBar' in $$props) $$invalidate(2, searchBar = $$props.searchBar);
    		if ('searchValue' in $$props) $$invalidate(1, searchValue = $$props.searchValue);
    		if ('imgSrc' in $$props) $$invalidate(3, imgSrc = $$props.imgSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*searchValue*/ 2) {
    			$$invalidate(3, imgSrc = searchValue != String()
    			? "./img/x.svg"
    			: "./img/search.svg");
    		}

    		if ($$self.$$.dirty & /*searchValue*/ 2) {
    			{
    				dispatcher("input", searchValue);
    			}
    		}
    	};

    	return [
    		placeholder,
    		searchValue,
    		searchBar,
    		imgSrc,
    		searchWidth,
    		click_handler,
    		input_input_handler,
    		div1_binding
    	];
    }

    class Searchbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { placeholder: 0, searchWidth: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Searchbar",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get placeholder() {
    		throw new Error("<Searchbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Searchbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchWidth() {
    		throw new Error("<Searchbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchWidth(value) {
    		throw new Error("<Searchbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utils\userDataContainer.svelte generated by Svelte v3.46.4 */

    const file$b = "src\\utils\\userDataContainer.svelte";

    // (13:8) {:else}
    function create_else_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*username*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1) set_data_dev(t, /*username*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(13:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:8) {#if showFullText == "username"}
    function create_if_block_1$6(ctx) {
    	let kbd;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			kbd = element("kbd");
    			kbd.textContent = "Username";
    			t1 = space();
    			t2 = text(/*username*/ ctx[0]);
    			attr_dev(kbd, "class", "svelte-1t68jhx");
    			add_location(kbd, file$b, 11, 12, 426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, kbd, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 1) set_data_dev(t2, /*username*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(kbd);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(11:8) {#if showFullText == \\\"username\\\"}",
    		ctx
    	});

    	return block;
    }

    // (23:8) {:else}
    function create_else_block$6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*email*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*email*/ 2) set_data_dev(t, /*email*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(23:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#if showFullText == "email"}
    function create_if_block$6(ctx) {
    	let kbd;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			kbd = element("kbd");
    			kbd.textContent = "Email";
    			t1 = space();
    			t2 = text(/*email*/ ctx[1]);
    			attr_dev(kbd, "class", "svelte-1t68jhx");
    			add_location(kbd, file$b, 21, 12, 831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, kbd, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*email*/ 2) set_data_dev(t2, /*email*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(kbd);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(21:8) {#if showFullText == \\\"email\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let p0;
    	let t;
    	let p1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*showFullText*/ ctx[2] == "username") return create_if_block_1$6;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*showFullText*/ ctx[2] == "email") return create_if_block$6;
    		return create_else_block$6;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			if_block0.c();
    			t = space();
    			p1 = element("p");
    			if_block1.c();

    			set_style(p0, "display", /*showFullText*/ ctx[2] == "username"
    			? "block"
    			: /*showFullText*/ ctx[2] == "none" ? "block" : "none");

    			set_style(p0, "width", /*showFullText*/ ctx[2] == "username" ? "100%" : "50%");
    			attr_dev(p0, "class", "svelte-1t68jhx");
    			add_location(p0, file$b, 6, 4, 111);

    			set_style(p1, "display", /*showFullText*/ ctx[2] == "email"
    			? "block"
    			: /*showFullText*/ ctx[2] == "none" ? "block" : "none");

    			set_style(p1, "width", /*showFullText*/ ctx[2] == "email" ? "100%" : "50%");
    			attr_dev(p1, "class", "svelte-1t68jhx");
    			add_location(p1, file$b, 16, 4, 528);
    			attr_dev(div, "class", "svelte-1t68jhx");
    			add_location(div, file$b, 5, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			if_block0.m(p0, null);
    			append_dev(div, t);
    			append_dev(div, p1);
    			if_block1.m(p1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(p1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(p0, null);
    				}
    			}

    			if (dirty & /*showFullText*/ 4) {
    				set_style(p0, "display", /*showFullText*/ ctx[2] == "username"
    				? "block"
    				: /*showFullText*/ ctx[2] == "none" ? "block" : "none");
    			}

    			if (dirty & /*showFullText*/ 4) {
    				set_style(p0, "width", /*showFullText*/ ctx[2] == "username" ? "100%" : "50%");
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(p1, null);
    				}
    			}

    			if (dirty & /*showFullText*/ 4) {
    				set_style(p1, "display", /*showFullText*/ ctx[2] == "email"
    				? "block"
    				: /*showFullText*/ ctx[2] == "none" ? "block" : "none");
    			}

    			if (dirty & /*showFullText*/ 4) {
    				set_style(p1, "width", /*showFullText*/ ctx[2] == "email" ? "100%" : "50%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserDataContainer', slots, []);
    	let { username } = $$props;
    	let { email } = $$props;
    	let showFullText = "none";
    	const writable_props = ['username', 'email'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UserDataContainer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => $$invalidate(2, showFullText = showFullText == "none" ? "username" : "none");
    	const click_handler_1 = _ => $$invalidate(2, showFullText = showFullText == "none" ? "email" : "none");

    	$$self.$$set = $$props => {
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    	};

    	$$self.$capture_state = () => ({ username, email, showFullText });

    	$$self.$inject_state = $$props => {
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('email' in $$props) $$invalidate(1, email = $$props.email);
    		if ('showFullText' in $$props) $$invalidate(2, showFullText = $$props.showFullText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [username, email, showFullText, click_handler, click_handler_1];
    }

    class UserDataContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { username: 0, email: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDataContainer",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*username*/ ctx[0] === undefined && !('username' in props)) {
    			console.warn("<UserDataContainer> was created without expected prop 'username'");
    		}

    		if (/*email*/ ctx[1] === undefined && !('email' in props)) {
    			console.warn("<UserDataContainer> was created without expected prop 'email'");
    		}
    	}

    	get username() {
    		throw new Error("<UserDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<UserDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<UserDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<UserDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\tabs\users.svelte generated by Svelte v3.46.4 */
    const file$a = "src\\components\\tabs\\users.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (110:59) 
    function create_if_block_3$5(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_4$3, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*hasResponseError*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "loading-spinner svelte-11c4at8");
    			add_location(div, file$a, 110, 12, 4266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(110:59) ",
    		ctx
    	});

    	return block;
    }

    // (87:8) {#if hasLoadedData && $currentTab == "users"}
    function create_if_block$5(ctx) {
    	let div0;
    	let t0;
    	let header;
    	let searchbar;
    	let t1;
    	let div1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let div2;
    	let t6;
    	let t7_value = /*userDataListReactive*/ ctx[6].length + "";
    	let t7;
    	let t8;
    	let t9_value = /*userDataList*/ ctx[0].length + "";
    	let t9;
    	let t10;
    	let t11_value = (/*userDataListReactive*/ ctx[6].length > 1 ? "s" : "") + "";
    	let t11;
    	let t12;
    	let footer;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	searchbar = new Searchbar({
    			props: {
    				placeholder: /*placeholder*/ ctx[3],
    				searchWidth: "calc(100% - 4px)"
    			},
    			$$inline: true
    		});

    	searchbar.$on("input", /*input_handler*/ ctx[9]);
    	const if_block_creators = [create_if_block_1$5, create_if_block_2$5];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*userDataListReactive*/ ctx[6].length > 0) return 0;
    		if (/*userDataListReactive*/ ctx[6].length == 0) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			header = element("header");
    			create_component(searchbar.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Username";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Email";
    			t5 = space();
    			div2 = element("div");
    			t6 = text("Showing ");
    			t7 = text(t7_value);
    			t8 = text(" of ");
    			t9 = text(t9_value);
    			t10 = text(" user");
    			t11 = text(t11_value);
    			t12 = space();
    			footer = element("footer");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "scroll-space svelte-11c4at8");
    			add_location(div0, file$a, 87, 12, 3160);
    			attr_dev(p0, "class", "svelte-11c4at8");
    			add_location(p0, file$a, 91, 20, 3391);
    			attr_dev(p1, "class", "svelte-11c4at8");
    			add_location(p1, file$a, 92, 20, 3428);
    			attr_dev(div1, "class", "head svelte-11c4at8");
    			add_location(div1, file$a, 90, 16, 3351);
    			attr_dev(div2, "class", "user-summary svelte-11c4at8");
    			add_location(div2, file$a, 94, 16, 3482);
    			attr_dev(header, "class", "svelte-11c4at8");
    			add_location(header, file$a, 88, 12, 3206);
    			attr_dev(footer, "class", "svelte-11c4at8");
    			add_location(footer, file$a, 98, 12, 3701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			mount_component(searchbar, header, null);
    			append_dev(header, t1);
    			append_dev(header, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(header, t5);
    			append_dev(header, div2);
    			append_dev(div2, t6);
    			append_dev(div2, t7);
    			append_dev(div2, t8);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div2, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, footer, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const searchbar_changes = {};
    			if (dirty & /*placeholder*/ 8) searchbar_changes.placeholder = /*placeholder*/ ctx[3];
    			searchbar.$set(searchbar_changes);
    			if ((!current || dirty & /*userDataListReactive*/ 64) && t7_value !== (t7_value = /*userDataListReactive*/ ctx[6].length + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*userDataList*/ 1) && t9_value !== (t9_value = /*userDataList*/ ctx[0].length + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*userDataListReactive*/ 64) && t11_value !== (t11_value = (/*userDataListReactive*/ ctx[6].length > 1 ? "s" : "") + "")) set_data_dev(t11, t11_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(footer, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			destroy_component(searchbar);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(footer);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(87:8) {#if hasLoadedData && $currentTab == \\\"users\\\"}",
    		ctx
    	});

    	return block;
    }

    // (114:16) {:else}
    function create_else_block$5(ctx) {
    	let noconnectionpage;
    	let current;
    	noconnectionpage = new NoConnectionPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(noconnectionpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noconnectionpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noconnectionpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noconnectionpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noconnectionpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(114:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (112:16) {#if !hasResponseError}
    function create_if_block_4$3(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 90, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(112:16) {#if !hasResponseError}",
    		ctx
    	});

    	return block;
    }

    // (104:59) 
    function create_if_block_2$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No users found";
    			attr_dev(div, "class", "no-user svelte-11c4at8");
    			add_location(div, file$a, 104, 20, 4056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(104:59) ",
    		ctx
    	});

    	return block;
    }

    // (100:16) {#if userDataListReactive.length > 0}
    function create_if_block_1$5(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*userDataListReactive*/ ctx[6];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*userData*/ ctx[14].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userDataListReactive*/ 64) {
    				each_value = /*userDataListReactive*/ ctx[6];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(100:16) {#if userDataListReactive.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (101:20) {#each userDataListReactive as userData, idx (userData.id)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let userdatacontainer;
    	let current;

    	userdatacontainer = new UserDataContainer({
    			props: {
    				email: /*userData*/ ctx[14].email,
    				username: /*userData*/ ctx[14].username
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(userdatacontainer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(userdatacontainer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const userdatacontainer_changes = {};
    			if (dirty & /*userDataListReactive*/ 64) userdatacontainer_changes.email = /*userData*/ ctx[14].email;
    			if (dirty & /*userDataListReactive*/ 64) userdatacontainer_changes.username = /*userData*/ ctx[14].username;
    			userdatacontainer.$set(userdatacontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(userdatacontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(userdatacontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(userdatacontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(101:20) {#each userDataListReactive as userData, idx (userData.id)}",
    		ctx
    	});

    	return block;
    }

    // (85:0) <Tabwapper show={$currentTab == "users"}>
    function create_default_slot$2(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$5, create_if_block_3$5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasLoadedData*/ ctx[5] && /*$currentTab*/ ctx[2] == "users") return 0;
    		if (!/*hasLoadedData*/ ctx[5] && /*$currentTab*/ ctx[2] == "users") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "svelte-11c4at8");
    			add_location(main, file$a, 85, 4, 3060);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "scroll", /*whenScrolled*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(85:0) <Tabwapper show={$currentTab == \\\"users\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let tabwapper;
    	let current;

    	tabwapper = new Tabwapper({
    			props: {
    				show: /*$currentTab*/ ctx[2] == "users",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabwapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabwapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabwapper_changes = {};
    			if (dirty & /*$currentTab*/ 4) tabwapper_changes.show = /*$currentTab*/ ctx[2] == "users";

    			if (dirty & /*$$scope, userDataListReactive, userDataList, placeholder, searchValue, hasLoadedData, $currentTab, hasResponseError*/ 131199) {
    				tabwapper_changes.$$scope = { dirty, ctx };
    			}

    			tabwapper.$set(tabwapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabwapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabwapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabwapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let userDataListReactive;
    	let $currentTab;
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(2, $currentTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Users', slots, []);
    	let coinLength = 100;
    	var lastScrollTop = 0;
    	let userDataList = [];
    	let placeholder = "Search";
    	let hasResponseError = false;
    	let hasLoadedData = false;
    	let isLoading = false;
    	let searchValue = String();

    	const loadData = () => {
    		if ($currentTab == "users" && !hasLoadedData) {
    			isLoading = true;

    			let headersList = {
    				"Accept": "*/*",
    				"Content-Type": "application/json"
    			};

    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/users", { method: "GET", headers: headersList }).then(function (response) {
    				return response.json();
    			}).then(function (data) {
    				$$invalidate(5, hasLoadedData = true);
    				$$invalidate(4, hasResponseError = false);
    				isLoading = false;
    				$$invalidate(0, userDataList = data);
    				$$invalidate(6, userDataListReactive = [...Array.from(userDataList).splice(0, coinLength)]);
    			}).catch(_ => {
    				isLoading = false;
    				$$invalidate(4, hasResponseError = true);
    				$$invalidate(5, hasLoadedData = false);
    			});
    		} else {
    			$$invalidate(5, hasLoadedData = false);
    			$$invalidate(4, hasResponseError = false);
    			isLoading = false;
    		}
    	};

    	onMount(loadData);

    	const loadDataWhenOnline = () => {
    		if (!hasLoadedData && window.navigator.onLine && hasResponseError) $$invalidate(4, hasResponseError = false);
    		if ($currentTab == "users" && !isLoading && window.navigator.onLine && !hasLoadedData) loadData();
    		requestAnimationFrame(loadDataWhenOnline);
    	};

    	const whenScrolled = ev => {
    		var st = ev.target.scrollTop;

    		if (st > lastScrollTop) {
    			$$invalidate(8, coinLength += 0.5);
    			$$invalidate(8, coinLength = Math.round(coinLength));

    			$$invalidate(8, coinLength = coinLength >= userDataList.length
    			? userDataList.length
    			: coinLength);
    		} else {
    			$$invalidate(8, coinLength -= 1);
    			$$invalidate(8, coinLength = coinLength <= 75 ? 75 : coinLength);
    		}

    		lastScrollTop = lastScrollTop = st <= 0 ? 0 : st;
    	};

    	requestAnimationFrame(loadDataWhenOnline);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Users> was created with unknown prop '${key}'`);
    	});

    	const input_handler = ev => $$invalidate(1, searchValue = ev.detail);

    	$$self.$capture_state = () => ({
    		onMount,
    		Circle,
    		currentTab,
    		NoConnectionPage,
    		Searchbar,
    		Tabwapper,
    		UserDataContainer,
    		coinLength,
    		lastScrollTop,
    		userDataList,
    		placeholder,
    		hasResponseError,
    		hasLoadedData,
    		isLoading,
    		searchValue,
    		loadData,
    		loadDataWhenOnline,
    		whenScrolled,
    		userDataListReactive,
    		$currentTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('coinLength' in $$props) $$invalidate(8, coinLength = $$props.coinLength);
    		if ('lastScrollTop' in $$props) lastScrollTop = $$props.lastScrollTop;
    		if ('userDataList' in $$props) $$invalidate(0, userDataList = $$props.userDataList);
    		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ('hasResponseError' in $$props) $$invalidate(4, hasResponseError = $$props.hasResponseError);
    		if ('hasLoadedData' in $$props) $$invalidate(5, hasLoadedData = $$props.hasLoadedData);
    		if ('isLoading' in $$props) isLoading = $$props.isLoading;
    		if ('searchValue' in $$props) $$invalidate(1, searchValue = $$props.searchValue);
    		if ('userDataListReactive' in $$props) $$invalidate(6, userDataListReactive = $$props.userDataListReactive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentTab*/ 4) {
    			{
    				if ($currentTab != "users") {
    					$$invalidate(3, placeholder = "Search");
    					$$invalidate(1, searchValue = String());
    					$$invalidate(4, hasResponseError = false);
    					$$invalidate(5, hasLoadedData = false);
    					isLoading = false;
    					$$invalidate(0, userDataList = []);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*userDataList, coinLength, searchValue*/ 259) {
    			$$invalidate(6, userDataListReactive = [
    				...Array.from(userDataList).splice(0, coinLength).filter(value => value.email.toLowerCase().search(searchValue.replaceAll("\\", "").toLowerCase()) >= 0 || value.username.toLowerCase().search(searchValue.replaceAll("\\", "").toLowerCase()) >= 0)
    			]);
    		}
    	};

    	{
    		loadData();
    	}

    	return [
    		userDataList,
    		searchValue,
    		$currentTab,
    		placeholder,
    		hasResponseError,
    		hasLoadedData,
    		userDataListReactive,
    		whenScrolled,
    		coinLength,
    		input_handler
    	];
    }

    class Users extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Users",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\utils\adContainer.svelte generated by Svelte v3.46.4 */
    const file$9 = "src\\utils\\adContainer.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let div;
    	let circle;
    	let t0;
    	let a;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let button;
    	let img1;
    	let img1_src_value;
    	let current;
    	let mounted;
    	let dispose;

    	circle = new Circle({
    			props: { color: "#303030", size: 45, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(circle.$$.fragment);
    			t0 = space();
    			a = element("a");
    			img0 = element("img");
    			t1 = space();
    			p = element("p");
    			t2 = text(/*message*/ ctx[1]);
    			t3 = space();
    			button = element("button");
    			img1 = element("img");
    			attr_dev(div, "class", "loading-spinner svelte-6wa50k");
    			set_style(div, "display", /*isLoading*/ ctx[2] ? "flex" : "none", false);
    			add_location(div, file$9, 40, 4, 1168);
    			if (!src_url_equal(img0.src, img0_src_value = /*image*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-6wa50k");
    			add_location(img0, file$9, 50, 8, 1553);
    			attr_dev(p, "title", /*message*/ ctx[1]);
    			attr_dev(p, "class", "svelte-6wa50k");
    			add_location(p, file$9, 51, 8, 1621);
    			if (!src_url_equal(img1.src, img1_src_value = "./img/x.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-6wa50k");
    			add_location(img1, file$9, 53, 12, 1728);
    			attr_dev(button, "class", "svelte-6wa50k");
    			add_location(button, file$9, 52, 8, 1663);
    			attr_dev(a, "title", /*message*/ ctx[1]);
    			attr_dev(a, "class", "container svelte-6wa50k");
    			set_style(a, "display", !/*isLoading*/ ctx[2] ? "block" : "none", false);
    			add_location(a, file$9, 44, 4, 1370);
    			attr_dev(main, "class", "svelte-6wa50k");
    			add_location(main, file$9, 39, 0, 1156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(circle, div, null);
    			append_dev(main, t0);
    			append_dev(main, a);
    			append_dev(a, img0);
    			append_dev(a, t1);
    			append_dev(a, p);
    			append_dev(p, t2);
    			append_dev(a, t3);
    			append_dev(a, button);
    			append_dev(button, img1);
    			/*button_binding*/ ctx[10](button);
    			/*a_binding*/ ctx[11](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "load", /*load_handler*/ ctx[9], false, false, false),
    					listen_dev(button, "click", /*deleteAd*/ ctx[6], false, false, false),
    					listen_dev(a, "click", /*whenClicked*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isLoading*/ 4) {
    				set_style(div, "display", /*isLoading*/ ctx[2] ? "flex" : "none", false);
    			}

    			if (!current || dirty & /*image*/ 1 && !src_url_equal(img0.src, img0_src_value = /*image*/ ctx[0])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty & /*message*/ 2) set_data_dev(t2, /*message*/ ctx[1]);

    			if (!current || dirty & /*message*/ 2) {
    				attr_dev(p, "title", /*message*/ ctx[1]);
    			}

    			if (!current || dirty & /*message*/ 2) {
    				attr_dev(a, "title", /*message*/ ctx[1]);
    			}

    			if (dirty & /*isLoading*/ 4) {
    				set_style(a, "display", !/*isLoading*/ ctx[2] ? "block" : "none", false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(circle);
    			/*button_binding*/ ctx[10](null);
    			/*a_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AdContainer', slots, []);
    	let { image } = $$props;
    	let { message } = $$props;
    	let { link } = $$props;
    	let { index } = $$props;
    	let dispatcher = createEventDispatcher();
    	let isLoading = true;
    	let anchor = null;
    	let exitButton = null;

    	const whenClicked = e => {
    		e.preventDefault();

    		if (anchor != null && exitButton != null) {
    			if (!anchor.isSameNode(exitButton) && !exitButton.contains(e.target)) {
    				window.open(link);
    			}
    		}
    	};

    	const deleteAd = () => {
    		$$invalidate(2, isLoading = true);

    		fetch(`https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/ads/${index}`, {
    			method: "DELETE",
    			headers: {
    				"Accept": "*/*",
    				"Content-Type": "application/json"
    			}
    		}).then(function (response) {
    			return response.json();
    		}).then(function (data) {
    			$$invalidate(2, isLoading = false);

    			if (data.state == "success") {
    				dispatcher("delete", index);
    			}
    		}).catch(_ => {
    			$$invalidate(2, isLoading = false);
    		});
    	};

    	const writable_props = ['image', 'message', 'link', 'index'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AdContainer> was created with unknown prop '${key}'`);
    	});

    	const load_handler = _ => $$invalidate(2, isLoading = false);

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			exitButton = $$value;
    			$$invalidate(4, exitButton);
    		});
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			anchor = $$value;
    			$$invalidate(3, anchor);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('image' in $$props) $$invalidate(0, image = $$props.image);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    		if ('link' in $$props) $$invalidate(7, link = $$props.link);
    		if ('index' in $$props) $$invalidate(8, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		Circle,
    		createEventDispatcher,
    		image,
    		message,
    		link,
    		index,
    		dispatcher,
    		isLoading,
    		anchor,
    		exitButton,
    		whenClicked,
    		deleteAd
    	});

    	$$self.$inject_state = $$props => {
    		if ('image' in $$props) $$invalidate(0, image = $$props.image);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    		if ('link' in $$props) $$invalidate(7, link = $$props.link);
    		if ('index' in $$props) $$invalidate(8, index = $$props.index);
    		if ('dispatcher' in $$props) dispatcher = $$props.dispatcher;
    		if ('isLoading' in $$props) $$invalidate(2, isLoading = $$props.isLoading);
    		if ('anchor' in $$props) $$invalidate(3, anchor = $$props.anchor);
    		if ('exitButton' in $$props) $$invalidate(4, exitButton = $$props.exitButton);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		image,
    		message,
    		isLoading,
    		anchor,
    		exitButton,
    		whenClicked,
    		deleteAd,
    		link,
    		index,
    		load_handler,
    		button_binding,
    		a_binding
    	];
    }

    class AdContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { image: 0, message: 1, link: 7, index: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdContainer",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[0] === undefined && !('image' in props)) {
    			console.warn("<AdContainer> was created without expected prop 'image'");
    		}

    		if (/*message*/ ctx[1] === undefined && !('message' in props)) {
    			console.warn("<AdContainer> was created without expected prop 'message'");
    		}

    		if (/*link*/ ctx[7] === undefined && !('link' in props)) {
    			console.warn("<AdContainer> was created without expected prop 'link'");
    		}

    		if (/*index*/ ctx[8] === undefined && !('index' in props)) {
    			console.warn("<AdContainer> was created without expected prop 'index'");
    		}
    	}

    	get image() {
    		throw new Error("<AdContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<AdContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<AdContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<AdContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<AdContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<AdContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<AdContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<AdContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\tabs\ads.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1$3, Object: Object_1$1 } = globals;
    const file$8 = "src\\components\\tabs\\ads.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (114:57) 
    function create_if_block_2$4(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_3$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*hasResponseError*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "loading-spinner svelte-kq7njf");
    			add_location(div, file$8, 114, 12, 3962);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(114:57) ",
    		ctx
    	});

    	return block;
    }

    // (88:8) {#if hasLoadedData && $currentTab == "ads" }
    function create_if_block$4(ctx) {
    	let div;
    	let t;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*adsDataList*/ ctx[0].length < 6 && create_if_block_1$4(ctx);
    	let each_value = /*adsDataList*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*adData*/ ctx[13].index;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-kq7njf");
    			add_location(div, file$8, 88, 12, 2890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*adsDataList*/ ctx[0].length < 6) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*adsDataList, deleteAd*/ 33) {
    				each_value = /*adsDataList*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(88:8) {#if hasLoadedData && $currentTab == \\\"ads\\\" }",
    		ctx
    	});

    	return block;
    }

    // (118:16) {:else}
    function create_else_block$4(ctx) {
    	let noconnectionpage;
    	let current;
    	noconnectionpage = new NoConnectionPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(noconnectionpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noconnectionpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noconnectionpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noconnectionpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noconnectionpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(118:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (116:16) {#if !hasResponseError}
    function create_if_block_3$4(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 90, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(116:16) {#if !hasResponseError}",
    		ctx
    	});

    	return block;
    }

    // (90:16) {#if adsDataList.length < 6}
    function create_if_block_1$4(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./img/plus-lg.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "plus");
    			attr_dev(img, "class", "svelte-kq7njf");
    			add_location(img, file$8, 100, 24, 3371);
    			attr_dev(button, "class", "svelte-kq7njf");
    			add_location(button, file$8, 90, 20, 2963);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(90:16) {#if adsDataList.length < 6}",
    		ctx
    	});

    	return block;
    }

    // (104:16) {#each adsDataList as adData, idx (adData.index)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let adcontainer;
    	let current;

    	function delete_handler(...args) {
    		return /*delete_handler*/ ctx[9](/*adData*/ ctx[13], ...args);
    	}

    	adcontainer = new AdContainer({
    			props: {
    				index: /*adData*/ ctx[13].index,
    				image: /*adData*/ ctx[13].image,
    				message: /*adData*/ ctx[13].message,
    				link: /*adData*/ ctx[13].link
    			},
    			$$inline: true
    		});

    	adcontainer.$on("delete", delete_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(adcontainer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(adcontainer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const adcontainer_changes = {};
    			if (dirty & /*adsDataList*/ 1) adcontainer_changes.index = /*adData*/ ctx[13].index;
    			if (dirty & /*adsDataList*/ 1) adcontainer_changes.image = /*adData*/ ctx[13].image;
    			if (dirty & /*adsDataList*/ 1) adcontainer_changes.message = /*adData*/ ctx[13].message;
    			if (dirty & /*adsDataList*/ 1) adcontainer_changes.link = /*adData*/ ctx[13].link;
    			adcontainer.$set(adcontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(adcontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(adcontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(adcontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(104:16) {#each adsDataList as adData, idx (adData.index)}",
    		ctx
    	});

    	return block;
    }

    // (86:0) <Tabwapper show={$currentTab == "ads"}>
    function create_default_slot$1(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$4, create_if_block_2$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasLoadedData*/ ctx[3] && /*$currentTab*/ ctx[4] == "ads") return 0;
    		if (!/*hasLoadedData*/ ctx[3] && /*$currentTab*/ ctx[4] == "ads") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "svelte-kq7njf");
    			add_location(main, file$8, 86, 4, 2816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(86:0) <Tabwapper show={$currentTab == \\\"ads\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let tabwapper;
    	let current;

    	tabwapper = new Tabwapper({
    			props: {
    				show: /*$currentTab*/ ctx[4] == "ads",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabwapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabwapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabwapper_changes = {};
    			if (dirty & /*$currentTab*/ 16) tabwapper_changes.show = /*$currentTab*/ ctx[4] == "ads";

    			if (dirty & /*$$scope, adsDataList, $addDataOption, hasLoadedData, $currentTab, hasResponseError*/ 65567) {
    				tabwapper_changes.$$scope = { dirty, ctx };
    			}

    			tabwapper.$set(tabwapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabwapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabwapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabwapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $addDataOption;
    	let $currentTab;
    	validate_store(addDataOption, 'addDataOption');
    	component_subscribe($$self, addDataOption, $$value => $$invalidate(1, $addDataOption = $$value));
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(4, $currentTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ads', slots, []);
    	let hasResponseError = false;
    	let hasLoadedData = false;
    	let isLoading = false;
    	let adsDataList = [];

    	const loadData = () => {
    		if (!hasLoadedData) {
    			isLoading = true;

    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/ads", {
    				method: "GET",
    				headers: {
    					"Accept": "*/*",
    					"Content-Type": "application/json"
    				}
    			}).then(function (response) {
    				return response.json();
    			}).then(function (data) {
    				if (data.state == "success") {
    					$$invalidate(3, hasLoadedData = true);
    					$$invalidate(2, hasResponseError = false);
    					isLoading = false;
    					$$invalidate(0, adsDataList = data.data);
    				} else {
    					throw new Error();
    				}
    			}).catch(_ => {
    				isLoading = false;
    				$$invalidate(2, hasResponseError = true);
    				$$invalidate(3, hasLoadedData = false);
    			});
    		} else {
    			$$invalidate(3, hasLoadedData = false);
    			$$invalidate(2, hasResponseError = false);
    			isLoading = false;
    		}
    	};

    	const loadDataWhenOnline = () => {
    		if (!hasLoadedData && window.navigator.onLine && hasResponseError) $$invalidate(2, hasResponseError = false);
    		if ($currentTab == "ads" && !isLoading && window.navigator.onLine && !hasLoadedData) loadData();
    		requestAnimationFrame(loadDataWhenOnline);
    	};

    	let deleteIndex = null;
    	let markforDelete = false;

    	const deleteAd = id => {
    		$$invalidate(7, markforDelete = true);
    		$$invalidate(6, deleteIndex = id);
    	};

    	requestAnimationFrame(loadDataWhenOnline);
    	onMount(loadData);
    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ads> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => {
    		set_store_value(
    			addDataOption,
    			$addDataOption = {
    				show: true,
    				page: "ad",
    				input: { id: String(adsDataList.length + 1) },
    				output: null
    			},
    			$addDataOption
    		);
    	};

    	const delete_handler = (adData, _) => deleteAd(adData.index);

    	$$self.$capture_state = () => ({
    		onMount,
    		Circle,
    		currentTab,
    		addDataOption,
    		AdContainer,
    		NoConnectionPage,
    		Tabwapper,
    		hasResponseError,
    		hasLoadedData,
    		isLoading,
    		adsDataList,
    		loadData,
    		loadDataWhenOnline,
    		deleteIndex,
    		markforDelete,
    		deleteAd,
    		$addDataOption,
    		$currentTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('hasResponseError' in $$props) $$invalidate(2, hasResponseError = $$props.hasResponseError);
    		if ('hasLoadedData' in $$props) $$invalidate(3, hasLoadedData = $$props.hasLoadedData);
    		if ('isLoading' in $$props) isLoading = $$props.isLoading;
    		if ('adsDataList' in $$props) $$invalidate(0, adsDataList = $$props.adsDataList);
    		if ('deleteIndex' in $$props) $$invalidate(6, deleteIndex = $$props.deleteIndex);
    		if ('markforDelete' in $$props) $$invalidate(7, markforDelete = $$props.markforDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$addDataOption, adsDataList*/ 3) {
    			{
    				if ($addDataOption.output != null) {
    					if ($addDataOption.output.from == "ad") {
    						let data = $addDataOption.output.data;
    						let index = (adsDataList.length + 1).toString();
    						$$invalidate(0, adsDataList = [Object.assign(Object.assign({}, data), { index }), ...adsDataList]);

    						set_store_value(
    							addDataOption,
    							$addDataOption = {
    								show: false,
    								page: "none",
    								input: null,
    								output: null
    							},
    							$addDataOption
    						);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*markforDelete, deleteIndex, adsDataList*/ 193) {
    			{
    				if (markforDelete && deleteIndex != null) {
    					$$invalidate(0, adsDataList = adsDataList.filter(value => value.index != deleteIndex));
    					$$invalidate(0, adsDataList = [...adsDataList]);
    					$$invalidate(7, markforDelete = false);
    					$$invalidate(6, deleteIndex = null);
    				}
    			}
    		}
    	};

    	{
    		loadData();
    	}

    	return [
    		adsDataList,
    		$addDataOption,
    		hasResponseError,
    		hasLoadedData,
    		$currentTab,
    		deleteAd,
    		deleteIndex,
    		markforDelete,
    		click_handler,
    		delete_handler
    	];
    }

    class Ads extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ads",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\utils\messageContainer.svelte generated by Svelte v3.46.4 */
    const file$7 = "src\\utils\\messageContainer.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let div0;
    	let circle;
    	let t0;
    	let div1;
    	let img;
    	let img_src_value;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let p2;
    	let current;
    	let mounted;
    	let dispose;

    	circle = new Circle({
    			props: { color: "#303030", size: 45, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(circle.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			img = element("img");
    			t1 = space();
    			p0 = element("p");
    			t2 = text(/*link*/ ctx[2]);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*message*/ ctx[0]);
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = `${/*postAge*/ ctx[4]}`;
    			attr_dev(div0, "class", "loading-spinner svelte-tfmlrk");
    			set_style(div0, "display", /*isLoading*/ ctx[3] ? "flex" : "none", false);
    			add_location(div0, file$7, 25, 4, 1033);
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-tfmlrk");
    			add_location(img, file$7, 29, 8, 1267);
    			attr_dev(p0, "id", "link");
    			attr_dev(p0, "target", "blank");
    			attr_dev(p0, "class", "svelte-tfmlrk");
    			add_location(p0, file$7, 30, 8, 1334);
    			attr_dev(p1, "id", "message");
    			attr_dev(p1, "class", "svelte-tfmlrk");
    			add_location(p1, file$7, 31, 8, 1416);
    			attr_dev(p2, "id", "date");
    			attr_dev(p2, "class", "svelte-tfmlrk");
    			add_location(p2, file$7, 34, 8, 1479);
    			attr_dev(div1, "class", "container svelte-tfmlrk");
    			set_style(div1, "display", !/*isLoading*/ ctx[3] ? "block" : "none", false);
    			add_location(div1, file$7, 28, 4, 1184);
    			attr_dev(main, "class", "svelte-tfmlrk");
    			add_location(main, file$7, 24, 0, 1021);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(circle, div0, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "load", /*load_handler*/ ctx[6], false, false, false),
    					listen_dev(p0, "click", /*click_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isLoading*/ 8) {
    				set_style(div0, "display", /*isLoading*/ ctx[3] ? "flex" : "none", false);
    			}

    			if (!current || dirty & /*image*/ 2 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*link*/ 4) set_data_dev(t2, /*link*/ ctx[2]);
    			if (!current || dirty & /*message*/ 1) set_data_dev(t4, /*message*/ ctx[0]);

    			if (dirty & /*isLoading*/ 8) {
    				set_style(div1, "display", !/*isLoading*/ ctx[3] ? "block" : "none", false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(circle);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MessageContainer', slots, []);
    	let { message } = $$props;
    	let { image } = $$props;
    	let { link } = $$props;
    	let { date } = $$props;
    	let postDate = new Date(date).getTime();
    	let currentDate = Date.now();
    	let seconds = Math.floor((currentDate - postDate) / 1000);
    	let minutes = Math.floor(seconds / 60);
    	let hours = Math.floor(minutes / 60);
    	let days = Math.floor(hours / 24);
    	let weeks = Math.floor(days / 7);
    	let years = new Date(currentDate).getFullYear() - new Date(postDate).getFullYear();
    	let months = years * 12 + (new Date(currentDate).getMonth() - new Date(postDate).getMonth());

    	let postAge = years > 0
    	? `${years}y`
    	: months > 0
    		? `${months}${months > 1 ? "mths" : "mth"}`
    		: weeks > 0
    			? `${weeks}w`
    			: days > 0
    				? `${days}${days > 1 ? "days" : "day"}`
    				: hours > 0
    					? `${hours}h`
    					: minutes > 0
    						? `${minutes}m`
    						: `${seconds > 0 ? seconds : "1"}s`;

    	let isLoading = true;
    	const writable_props = ['message', 'image', 'link', 'date'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MessageContainer> was created with unknown prop '${key}'`);
    	});

    	const load_handler = _ => $$invalidate(3, isLoading = false);
    	const click_handler = _ => window.open(link);

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('image' in $$props) $$invalidate(1, image = $$props.image);
    		if ('link' in $$props) $$invalidate(2, link = $$props.link);
    		if ('date' in $$props) $$invalidate(5, date = $$props.date);
    	};

    	$$self.$capture_state = () => ({
    		Circle,
    		message,
    		image,
    		link,
    		date,
    		postDate,
    		currentDate,
    		seconds,
    		minutes,
    		hours,
    		days,
    		weeks,
    		years,
    		months,
    		postAge,
    		isLoading
    	});

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('image' in $$props) $$invalidate(1, image = $$props.image);
    		if ('link' in $$props) $$invalidate(2, link = $$props.link);
    		if ('date' in $$props) $$invalidate(5, date = $$props.date);
    		if ('postDate' in $$props) postDate = $$props.postDate;
    		if ('currentDate' in $$props) currentDate = $$props.currentDate;
    		if ('seconds' in $$props) seconds = $$props.seconds;
    		if ('minutes' in $$props) minutes = $$props.minutes;
    		if ('hours' in $$props) hours = $$props.hours;
    		if ('days' in $$props) days = $$props.days;
    		if ('weeks' in $$props) weeks = $$props.weeks;
    		if ('years' in $$props) years = $$props.years;
    		if ('months' in $$props) months = $$props.months;
    		if ('postAge' in $$props) $$invalidate(4, postAge = $$props.postAge);
    		if ('isLoading' in $$props) $$invalidate(3, isLoading = $$props.isLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, image, link, isLoading, postAge, date, load_handler, click_handler];
    }

    class MessageContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { message: 0, image: 1, link: 2, date: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MessageContainer",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !('message' in props)) {
    			console.warn("<MessageContainer> was created without expected prop 'message'");
    		}

    		if (/*image*/ ctx[1] === undefined && !('image' in props)) {
    			console.warn("<MessageContainer> was created without expected prop 'image'");
    		}

    		if (/*link*/ ctx[2] === undefined && !('link' in props)) {
    			console.warn("<MessageContainer> was created without expected prop 'link'");
    		}

    		if (/*date*/ ctx[5] === undefined && !('date' in props)) {
    			console.warn("<MessageContainer> was created without expected prop 'date'");
    		}
    	}

    	get message() {
    		throw new Error("<MessageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<MessageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<MessageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<MessageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<MessageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<MessageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<MessageContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<MessageContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\tabs\message.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1$2, Object: Object_1 } = globals;
    const file$6 = "src\\components\\tabs\\message.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (112:61) 
    function create_if_block_2$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_3$3, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*hasResponseError*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "loading-spinner svelte-aaiv2j");
    			add_location(div, file$6, 112, 12, 4299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(112:61) ",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if hasLoadedData && $currentTab == "message" }
    function create_if_block$3(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let button;
    	let img;
    	let img_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*messageList, messageLength*/ 5) show_if = null;
    		if (show_if == null) show_if = !!(Array.from(/*messageList*/ ctx[0]).splice(0, /*messageLength*/ ctx[2]).length > 0);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			t = space();
    			button = element("button");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./img/plus-lg.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-aaiv2j");
    			add_location(img, file$6, 109, 16, 4163);
    			attr_dev(button, "id", "post");
    			attr_dev(button, "class", "svelte-aaiv2j");
    			add_location(button, file$6, 101, 12, 3899);
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, img);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(t.parentNode, t);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(84:8) {#if hasLoadedData && $currentTab == \\\"message\\\" }",
    		ctx
    	});

    	return block;
    }

    // (116:16) {:else}
    function create_else_block_1(ctx) {
    	let noconnectionpage;
    	let current;
    	noconnectionpage = new NoConnectionPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(noconnectionpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noconnectionpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noconnectionpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noconnectionpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noconnectionpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(116:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (114:16) {#if !hasResponseError}
    function create_if_block_3$3(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 90, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(114:16) {#if !hasResponseError}",
    		ctx
    	});

    	return block;
    }

    // (96:12) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "No message";
    			if (!src_url_equal(img.src, img_src_value = "./img/no-message.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-aaiv2j");
    			add_location(img, file$6, 97, 20, 3758);
    			attr_dev(span, "class", "svelte-aaiv2j");
    			add_location(span, file$6, 98, 20, 3819);
    			attr_dev(div, "class", "no-message-container svelte-aaiv2j");
    			add_location(div, file$6, 96, 16, 3702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(96:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (85:12) {#if (Array.from(messageList).splice(0, messageLength)).length > 0}
    function create_if_block_1$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = Array.from(/*messageList*/ ctx[0]).splice(0, /*messageLength*/ ctx[2]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*messageDate*/ ctx[12].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-aaiv2j");
    			add_location(div, file$6, 85, 16, 3158);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Array, messageList, messageLength*/ 5) {
    				each_value = Array.from(/*messageList*/ ctx[0]).splice(0, /*messageLength*/ ctx[2]);
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(85:12) {#if (Array.from(messageList).splice(0, messageLength)).length > 0}",
    		ctx
    	});

    	return block;
    }

    // (87:20) {#each (Array.from(messageList).splice(0, messageLength)) as messageDate, idx (messageDate.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let messagecontainer;
    	let current;

    	messagecontainer = new MessageContainer({
    			props: {
    				date: /*messageDate*/ ctx[12].date,
    				link: /*messageDate*/ ctx[12].link,
    				image: /*messageDate*/ ctx[12].image,
    				message: /*messageDate*/ ctx[12].message
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(messagecontainer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(messagecontainer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const messagecontainer_changes = {};
    			if (dirty & /*messageList, messageLength*/ 5) messagecontainer_changes.date = /*messageDate*/ ctx[12].date;
    			if (dirty & /*messageList, messageLength*/ 5) messagecontainer_changes.link = /*messageDate*/ ctx[12].link;
    			if (dirty & /*messageList, messageLength*/ 5) messagecontainer_changes.image = /*messageDate*/ ctx[12].image;
    			if (dirty & /*messageList, messageLength*/ 5) messagecontainer_changes.message = /*messageDate*/ ctx[12].message;
    			messagecontainer.$set(messagecontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(messagecontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(messagecontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(messagecontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(87:20) {#each (Array.from(messageList).splice(0, messageLength)) as messageDate, idx (messageDate.id)}",
    		ctx
    	});

    	return block;
    }

    // (82:0) <Tabwapper show={$currentTab == "message"}>
    function create_default_slot(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$3, create_if_block_2$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasLoadedData*/ ctx[4] && /*$currentTab*/ ctx[5] == "message") return 0;
    		if (!/*hasLoadedData*/ ctx[4] && /*$currentTab*/ ctx[5] == "message") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "svelte-aaiv2j");
    			set_style(main, "display", /*$currentTab*/ ctx[5] == "message" ? "flex" : "none", false);
    			add_location(main, file$6, 82, 4, 2911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "scroll", /*whenScrolled*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty & /*$currentTab*/ 32) {
    				set_style(main, "display", /*$currentTab*/ ctx[5] == "message" ? "flex" : "none", false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(82:0) <Tabwapper show={$currentTab == \\\"message\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let tabwapper;
    	let current;

    	tabwapper = new Tabwapper({
    			props: {
    				show: /*$currentTab*/ ctx[5] == "message",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabwapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabwapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabwapper_changes = {};
    			if (dirty & /*$currentTab*/ 32) tabwapper_changes.show = /*$currentTab*/ ctx[5] == "message";

    			if (dirty & /*$$scope, $currentTab, $addDataOption, messageList, messageLength, hasLoadedData, hasResponseError*/ 32831) {
    				tabwapper_changes.$$scope = { dirty, ctx };
    			}

    			tabwapper.$set(tabwapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabwapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabwapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabwapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $currentTab;
    	let $addDataOption;
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(5, $currentTab = $$value));
    	validate_store(addDataOption, 'addDataOption');
    	component_subscribe($$self, addDataOption, $$value => $$invalidate(1, $addDataOption = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Message', slots, []);
    	let messageLength = 100;
    	var lastScrollTop = 0;
    	let hasResponseError = false;
    	let hasLoadedData = false;
    	let isLoading = false;
    	let messageList = [];

    	const loadData = () => {
    		if (!hasLoadedData) {
    			isLoading = true;

    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/message", {
    				method: "GET",
    				headers: {
    					"Accept": "*/*",
    					"Content-Type": "application/json"
    				}
    			}).then(function (response) {
    				return response.json();
    			}).then(function (data) {
    				if (data.state == "success") {
    					$$invalidate(4, hasLoadedData = true);
    					$$invalidate(3, hasResponseError = false);
    					isLoading = false;
    					$$invalidate(0, messageList = Array.from(data.data).map((value, index) => Object.assign(Object.assign({}, value), { id: index })));
    				} else {
    					throw new Error();
    				}
    			}).catch(_ => {
    				isLoading = false;
    				$$invalidate(3, hasResponseError = true);
    				$$invalidate(4, hasLoadedData = false);
    			});
    		}
    	};

    	const loadDataWhenOnline = () => {
    		if (!hasLoadedData && window.navigator.onLine && hasResponseError) $$invalidate(3, hasResponseError = false);
    		if ($currentTab == "message" && !isLoading && window.navigator.onLine && !hasLoadedData) loadData();
    		requestAnimationFrame(loadDataWhenOnline);
    	};

    	const whenScrolled = ev => {
    		var st = ev.target.scrollTop;

    		if (st > lastScrollTop) {
    			$$invalidate(2, messageLength += 0.5);
    			$$invalidate(2, messageLength = Math.round(messageLength));

    			$$invalidate(2, messageLength = messageLength >= messageList.length
    			? messageList.length
    			: messageLength);
    		} else {
    			$$invalidate(2, messageLength -= 1);
    			$$invalidate(2, messageLength = messageLength <= 75 ? 75 : messageLength);
    		}

    		lastScrollTop = lastScrollTop = st <= 0 ? 0 : st;
    	};

    	requestAnimationFrame(loadDataWhenOnline);
    	onMount(loadData);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Message> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => {
    		set_store_value(
    			addDataOption,
    			$addDataOption = {
    				show: true,
    				page: "message",
    				input: null,
    				output: null
    			},
    			$addDataOption
    		);
    	};

    	$$self.$capture_state = () => ({
    		Tabwapper,
    		addDataOption,
    		currentTab,
    		onMount,
    		Circle,
    		NoConnectionPage,
    		MessageContainer,
    		messageLength,
    		lastScrollTop,
    		hasResponseError,
    		hasLoadedData,
    		isLoading,
    		messageList,
    		loadData,
    		loadDataWhenOnline,
    		whenScrolled,
    		$currentTab,
    		$addDataOption
    	});

    	$$self.$inject_state = $$props => {
    		if ('messageLength' in $$props) $$invalidate(2, messageLength = $$props.messageLength);
    		if ('lastScrollTop' in $$props) lastScrollTop = $$props.lastScrollTop;
    		if ('hasResponseError' in $$props) $$invalidate(3, hasResponseError = $$props.hasResponseError);
    		if ('hasLoadedData' in $$props) $$invalidate(4, hasLoadedData = $$props.hasLoadedData);
    		if ('isLoading' in $$props) isLoading = $$props.isLoading;
    		if ('messageList' in $$props) $$invalidate(0, messageList = $$props.messageList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$addDataOption, messageList*/ 3) {
    			{
    				if ($addDataOption.output != null) {
    					if ($addDataOption.output.from == "message") {
    						let data = $addDataOption.output.data;

    						$$invalidate(0, messageList = [
    							Object.assign(Object.assign({}, data), { id: messageList.length + 1 }),
    							...messageList
    						]);

    						set_store_value(
    							addDataOption,
    							$addDataOption = {
    								show: false,
    								page: "none",
    								input: null,
    								output: null
    							},
    							$addDataOption
    						);
    					}
    				}
    			}
    		}
    	};

    	{
    		loadData();
    	}

    	return [
    		messageList,
    		$addDataOption,
    		messageLength,
    		hasResponseError,
    		hasLoadedData,
    		$currentTab,
    		whenScrolled,
    		click_handler
    	];
    }

    class Message extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Message",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\utils\coinDataContainer.svelte generated by Svelte v3.46.4 */
    const file$5 = "src\\utils\\coinDataContainer.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let t1;
    	let t2;
    	let p1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let span0;
    	let t4;
    	let t5;
    	let span1;
    	let t6;
    	let t7;
    	let kbd;
    	let t8;
    	let t9;
    	let p2;
    	let t10;
    	let html_tag;
    	let raw_value = /*current_price*/ ctx[5].toPrecision(5).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,').replace(/e\+?/, 'E') + "";
    	let t11;
    	let p3;
    	let t12_value = /*price_change_percentage_1h_in_currency*/ ctx[1].toPrecision(2) + "";
    	let t12;
    	let t13;
    	let t14;
    	let p4;
    	let t15_value = /*price_change_percentage_24h*/ ctx[0].toPrecision(2) + "";
    	let t15;
    	let t16;
    	let t17;
    	let p5;
    	let t18;
    	let t19_value = /*market_cap*/ ctx[6].toString().replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,') + "";
    	let t19;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			img0 = element("img");
    			t0 = space();
    			t1 = text(/*market_cap_rank*/ ctx[7]);
    			t2 = space();
    			p1 = element("p");
    			img1 = element("img");
    			t3 = space();
    			span0 = element("span");
    			t4 = text(/*name*/ ctx[2]);
    			t5 = space();
    			span1 = element("span");
    			t6 = text(/*symbol*/ ctx[3]);
    			t7 = space();
    			kbd = element("kbd");
    			t8 = text(/*symbol*/ ctx[3]);
    			t9 = space();
    			p2 = element("p");
    			t10 = text("$");
    			html_tag = new HtmlTag();
    			t11 = space();
    			p3 = element("p");
    			t12 = text(t12_value);
    			t13 = text("%");
    			t14 = space();
    			p4 = element("p");
    			t15 = text(t15_value);
    			t16 = text("%");
    			t17 = space();
    			p5 = element("p");
    			t18 = text("$");
    			t19 = text(t19_value);

    			if (!src_url_equal(img0.src, img0_src_value = /*is_add_to_favourite*/ ctx[8]
    			? "./img/star-fill.svg"
    			: "./img/star.svg")) attr_dev(img0, "src", img0_src_value);

    			attr_dev(img0, "alt", "star");
    			attr_dev(img0, "class", "svelte-1otgjc1");
    			add_location(img0, file$5, 27, 12, 897);
    			attr_dev(p0, "id", "rank");
    			attr_dev(p0, "class", "svelte-1otgjc1");
    			add_location(p0, file$5, 26, 8, 870);
    			if (!src_url_equal(img1.src, img1_src_value = /*image*/ ctx[4])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", /*symbol*/ ctx[3]);
    			attr_dev(img1, "class", "svelte-1otgjc1");
    			add_location(img1, file$5, 30, 12, 1102);
    			attr_dev(span0, "id", "name");
    			attr_dev(span0, "class", "svelte-1otgjc1");
    			add_location(span0, file$5, 31, 12, 1146);
    			attr_dev(span1, "id", "symbol");
    			attr_dev(span1, "class", "svelte-1otgjc1");
    			add_location(span1, file$5, 32, 12, 1189);
    			attr_dev(kbd, "id", "symbol");
    			attr_dev(kbd, "class", "svelte-1otgjc1");
    			add_location(kbd, file$5, 33, 12, 1236);
    			attr_dev(p1, "id", "name");
    			attr_dev(p1, "class", "svelte-1otgjc1");
    			add_location(p1, file$5, 29, 8, 1075);
    			attr_dev(div0, "class", "fixed-head svelte-1otgjc1");
    			add_location(div0, file$5, 25, 4, 836);
    			html_tag.a = null;
    			attr_dev(p2, "id", "price");
    			attr_dev(p2, "class", "svelte-1otgjc1");
    			add_location(p2, file$5, 36, 4, 1299);

    			set_style(p3, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    			? "#66bb6a"
    			: "#f44336");

    			attr_dev(p3, "id", "change");
    			attr_dev(p3, "class", "svelte-1otgjc1");
    			add_location(p3, file$5, 39, 4, 1452);

    			set_style(p4, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    			? "#66bb6a"
    			: "#f44336");

    			attr_dev(p4, "id", "change");
    			attr_dev(p4, "class", "svelte-1otgjc1");
    			add_location(p4, file$5, 42, 4, 1634);
    			attr_dev(p5, "id", "mkt-cap");
    			attr_dev(p5, "class", "svelte-1otgjc1");
    			add_location(p5, file$5, 45, 4, 1805);
    			attr_dev(div1, "class", "container svelte-1otgjc1");
    			add_location(div1, file$5, 24, 0, 807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, img0);
    			/*img0_binding*/ ctx[11](img0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, img1);
    			append_dev(p1, t3);
    			append_dev(p1, span0);
    			append_dev(span0, t4);
    			append_dev(p1, t5);
    			append_dev(p1, span1);
    			append_dev(span1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, kbd);
    			append_dev(kbd, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p2);
    			append_dev(p2, t10);
    			html_tag.m(raw_value, p2);
    			append_dev(div1, t11);
    			append_dev(div1, p3);
    			append_dev(p3, t12);
    			append_dev(p3, t13);
    			append_dev(div1, t14);
    			append_dev(div1, p4);
    			append_dev(p4, t15);
    			append_dev(p4, t16);
    			append_dev(div1, t17);
    			append_dev(div1, p5);
    			append_dev(p5, t18);
    			append_dev(p5, t19);

    			if (!mounted) {
    				dispose = listen_dev(img0, "click", /*addToFavourite*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*is_add_to_favourite*/ 256 && !src_url_equal(img0.src, img0_src_value = /*is_add_to_favourite*/ ctx[8]
    			? "./img/star-fill.svg"
    			: "./img/star.svg")) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*market_cap_rank*/ 128) set_data_dev(t1, /*market_cap_rank*/ ctx[7]);

    			if (dirty & /*image*/ 16 && !src_url_equal(img1.src, img1_src_value = /*image*/ ctx[4])) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*symbol*/ 8) {
    				attr_dev(img1, "alt", /*symbol*/ ctx[3]);
    			}

    			if (dirty & /*name*/ 4) set_data_dev(t4, /*name*/ ctx[2]);
    			if (dirty & /*symbol*/ 8) set_data_dev(t6, /*symbol*/ ctx[3]);
    			if (dirty & /*symbol*/ 8) set_data_dev(t8, /*symbol*/ ctx[3]);
    			if (dirty & /*current_price*/ 32 && raw_value !== (raw_value = /*current_price*/ ctx[5].toPrecision(5).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,').replace(/e\+?/, 'E') + "")) html_tag.p(raw_value);
    			if (dirty & /*price_change_percentage_1h_in_currency*/ 2 && t12_value !== (t12_value = /*price_change_percentage_1h_in_currency*/ ctx[1].toPrecision(2) + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*price_change_percentage_1h_in_currency*/ 2) {
    				set_style(p3, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    				? "#66bb6a"
    				: "#f44336");
    			}

    			if (dirty & /*price_change_percentage_24h*/ 1 && t15_value !== (t15_value = /*price_change_percentage_24h*/ ctx[0].toPrecision(2) + "")) set_data_dev(t15, t15_value);

    			if (dirty & /*price_change_percentage_1h_in_currency*/ 2) {
    				set_style(p4, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    				? "#66bb6a"
    				: "#f44336");
    			}

    			if (dirty & /*market_cap*/ 64 && t19_value !== (t19_value = /*market_cap*/ ctx[6].toString().replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,') + "")) set_data_dev(t19, t19_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*img0_binding*/ ctx[11](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CoinDataContainer', slots, []);
    	let { name } = $$props;
    	let { symbol } = $$props;
    	let { image } = $$props;
    	let { current_price } = $$props;
    	let { market_cap } = $$props;
    	let { market_cap_rank } = $$props;
    	let { price_change_percentage_24h } = $$props;
    	let { price_change_percentage_1h_in_currency } = $$props;
    	let { is_add_to_favourite } = $$props;
    	const dispatcher = createEventDispatcher();
    	let imageElement = null;

    	const addToFavourite = e => {
    		if (!is_add_to_favourite && imageElement != null) {
    			dispatcher("toadd", {
    				x: imageElement.x + 2,
    				y: imageElement.y - 50,
    				name
    			});
    		}
    	};

    	const writable_props = [
    		'name',
    		'symbol',
    		'image',
    		'current_price',
    		'market_cap',
    		'market_cap_rank',
    		'price_change_percentage_24h',
    		'price_change_percentage_1h_in_currency',
    		'is_add_to_favourite'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CoinDataContainer> was created with unknown prop '${key}'`);
    	});

    	function img0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			imageElement = $$value;
    			$$invalidate(9, imageElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('symbol' in $$props) $$invalidate(3, symbol = $$props.symbol);
    		if ('image' in $$props) $$invalidate(4, image = $$props.image);
    		if ('current_price' in $$props) $$invalidate(5, current_price = $$props.current_price);
    		if ('market_cap' in $$props) $$invalidate(6, market_cap = $$props.market_cap);
    		if ('market_cap_rank' in $$props) $$invalidate(7, market_cap_rank = $$props.market_cap_rank);
    		if ('price_change_percentage_24h' in $$props) $$invalidate(0, price_change_percentage_24h = $$props.price_change_percentage_24h);
    		if ('price_change_percentage_1h_in_currency' in $$props) $$invalidate(1, price_change_percentage_1h_in_currency = $$props.price_change_percentage_1h_in_currency);
    		if ('is_add_to_favourite' in $$props) $$invalidate(8, is_add_to_favourite = $$props.is_add_to_favourite);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		name,
    		symbol,
    		image,
    		current_price,
    		market_cap,
    		market_cap_rank,
    		price_change_percentage_24h,
    		price_change_percentage_1h_in_currency,
    		is_add_to_favourite,
    		dispatcher,
    		imageElement,
    		addToFavourite
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('symbol' in $$props) $$invalidate(3, symbol = $$props.symbol);
    		if ('image' in $$props) $$invalidate(4, image = $$props.image);
    		if ('current_price' in $$props) $$invalidate(5, current_price = $$props.current_price);
    		if ('market_cap' in $$props) $$invalidate(6, market_cap = $$props.market_cap);
    		if ('market_cap_rank' in $$props) $$invalidate(7, market_cap_rank = $$props.market_cap_rank);
    		if ('price_change_percentage_24h' in $$props) $$invalidate(0, price_change_percentage_24h = $$props.price_change_percentage_24h);
    		if ('price_change_percentage_1h_in_currency' in $$props) $$invalidate(1, price_change_percentage_1h_in_currency = $$props.price_change_percentage_1h_in_currency);
    		if ('is_add_to_favourite' in $$props) $$invalidate(8, is_add_to_favourite = $$props.is_add_to_favourite);
    		if ('imageElement' in $$props) $$invalidate(9, imageElement = $$props.imageElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*price_change_percentage_1h_in_currency, price_change_percentage_24h*/ 3) {
    			{
    				if (price_change_percentage_1h_in_currency == null) $$invalidate(1, price_change_percentage_1h_in_currency = 0);
    				if (price_change_percentage_24h == null) $$invalidate(0, price_change_percentage_24h = 0);
    			}
    		}
    	};

    	return [
    		price_change_percentage_24h,
    		price_change_percentage_1h_in_currency,
    		name,
    		symbol,
    		image,
    		current_price,
    		market_cap,
    		market_cap_rank,
    		is_add_to_favourite,
    		imageElement,
    		addToFavourite,
    		img0_binding
    	];
    }

    class CoinDataContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			name: 2,
    			symbol: 3,
    			image: 4,
    			current_price: 5,
    			market_cap: 6,
    			market_cap_rank: 7,
    			price_change_percentage_24h: 0,
    			price_change_percentage_1h_in_currency: 1,
    			is_add_to_favourite: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CoinDataContainer",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'name'");
    		}

    		if (/*symbol*/ ctx[3] === undefined && !('symbol' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'symbol'");
    		}

    		if (/*image*/ ctx[4] === undefined && !('image' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'image'");
    		}

    		if (/*current_price*/ ctx[5] === undefined && !('current_price' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'current_price'");
    		}

    		if (/*market_cap*/ ctx[6] === undefined && !('market_cap' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'market_cap'");
    		}

    		if (/*market_cap_rank*/ ctx[7] === undefined && !('market_cap_rank' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'market_cap_rank'");
    		}

    		if (/*price_change_percentage_24h*/ ctx[0] === undefined && !('price_change_percentage_24h' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'price_change_percentage_24h'");
    		}

    		if (/*price_change_percentage_1h_in_currency*/ ctx[1] === undefined && !('price_change_percentage_1h_in_currency' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'price_change_percentage_1h_in_currency'");
    		}

    		if (/*is_add_to_favourite*/ ctx[8] === undefined && !('is_add_to_favourite' in props)) {
    			console.warn("<CoinDataContainer> was created without expected prop 'is_add_to_favourite'");
    		}
    	}

    	get name() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get symbol() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set symbol(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_price() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_price(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get market_cap() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set market_cap(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get market_cap_rank() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set market_cap_rank(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price_change_percentage_24h() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price_change_percentage_24h(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price_change_percentage_1h_in_currency() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price_change_percentage_1h_in_currency(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get is_add_to_favourite() {
    		throw new Error("<CoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_add_to_favourite(value) {
    		throw new Error("<CoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utils\favouriteCoinDataContainer.svelte generated by Svelte v3.46.4 */

    const file$4 = "src\\utils\\favouriteCoinDataContainer.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let img;
    	let img_src_value;
    	let t2;
    	let span0;
    	let t3;
    	let t4;
    	let span1;
    	let t5;
    	let t6;
    	let kbd;
    	let t7;
    	let t8;
    	let p2;
    	let t9;
    	let html_tag;
    	let raw_value = /*current_price*/ ctx[5].toPrecision(5).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,').replace(/e\+?/, 'E') + "";
    	let t10;
    	let p3;
    	let t11_value = /*price_change_percentage_1h_in_currency*/ ctx[1].toPrecision(2) + "";
    	let t11;
    	let t12;
    	let t13;
    	let p4;
    	let t14_value = /*price_change_percentage_24h*/ ctx[0].toPrecision(2) + "";
    	let t14;
    	let t15;
    	let t16;
    	let p5;
    	let t17;
    	let t18_value = /*market_cap*/ ctx[6].toString().replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,') + "";
    	let t18;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(/*market_cap_rank*/ ctx[7]);
    			t1 = space();
    			p1 = element("p");
    			img = element("img");
    			t2 = space();
    			span0 = element("span");
    			t3 = text(/*name*/ ctx[2]);
    			t4 = space();
    			span1 = element("span");
    			t5 = text(/*symbol*/ ctx[3]);
    			t6 = space();
    			kbd = element("kbd");
    			t7 = text(/*symbol*/ ctx[3]);
    			t8 = space();
    			p2 = element("p");
    			t9 = text("$");
    			html_tag = new HtmlTag();
    			t10 = space();
    			p3 = element("p");
    			t11 = text(t11_value);
    			t12 = text("%");
    			t13 = space();
    			p4 = element("p");
    			t14 = text(t14_value);
    			t15 = text("%");
    			t16 = space();
    			p5 = element("p");
    			t17 = text("$");
    			t18 = text(t18_value);
    			attr_dev(p0, "id", "rank");
    			attr_dev(p0, "class", "svelte-tc4ss1");
    			add_location(p0, file$4, 17, 8, 529);
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*symbol*/ ctx[3]);
    			attr_dev(img, "class", "svelte-tc4ss1");
    			add_location(img, file$4, 21, 12, 624);
    			attr_dev(span0, "id", "name");
    			attr_dev(span0, "class", "svelte-tc4ss1");
    			add_location(span0, file$4, 22, 12, 668);
    			attr_dev(span1, "id", "symbol");
    			attr_dev(span1, "class", "svelte-tc4ss1");
    			add_location(span1, file$4, 23, 12, 711);
    			attr_dev(kbd, "id", "symbol");
    			attr_dev(kbd, "class", "svelte-tc4ss1");
    			add_location(kbd, file$4, 24, 12, 758);
    			attr_dev(p1, "id", "name");
    			attr_dev(p1, "class", "svelte-tc4ss1");
    			add_location(p1, file$4, 20, 8, 597);
    			attr_dev(div0, "class", "fixed-head svelte-tc4ss1");
    			add_location(div0, file$4, 16, 4, 495);
    			html_tag.a = null;
    			attr_dev(p2, "id", "price");
    			attr_dev(p2, "class", "svelte-tc4ss1");
    			add_location(p2, file$4, 27, 4, 821);

    			set_style(p3, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    			? "#66bb6a"
    			: "#f44336");

    			attr_dev(p3, "id", "change");
    			attr_dev(p3, "class", "svelte-tc4ss1");
    			add_location(p3, file$4, 30, 4, 974);

    			set_style(p4, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    			? "#66bb6a"
    			: "#f44336");

    			attr_dev(p4, "id", "change");
    			attr_dev(p4, "class", "svelte-tc4ss1");
    			add_location(p4, file$4, 33, 4, 1156);
    			attr_dev(p5, "id", "mkt-cap");
    			attr_dev(p5, "class", "svelte-tc4ss1");
    			add_location(p5, file$4, 36, 4, 1327);
    			attr_dev(div1, "class", "container svelte-tc4ss1");
    			add_location(div1, file$4, 15, 0, 466);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, img);
    			append_dev(p1, t2);
    			append_dev(p1, span0);
    			append_dev(span0, t3);
    			append_dev(p1, t4);
    			append_dev(p1, span1);
    			append_dev(span1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, kbd);
    			append_dev(kbd, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p2);
    			append_dev(p2, t9);
    			html_tag.m(raw_value, p2);
    			append_dev(div1, t10);
    			append_dev(div1, p3);
    			append_dev(p3, t11);
    			append_dev(p3, t12);
    			append_dev(div1, t13);
    			append_dev(div1, p4);
    			append_dev(p4, t14);
    			append_dev(p4, t15);
    			append_dev(div1, t16);
    			append_dev(div1, p5);
    			append_dev(p5, t17);
    			append_dev(p5, t18);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*market_cap_rank*/ 128) set_data_dev(t0, /*market_cap_rank*/ ctx[7]);

    			if (dirty & /*image*/ 16 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*symbol*/ 8) {
    				attr_dev(img, "alt", /*symbol*/ ctx[3]);
    			}

    			if (dirty & /*name*/ 4) set_data_dev(t3, /*name*/ ctx[2]);
    			if (dirty & /*symbol*/ 8) set_data_dev(t5, /*symbol*/ ctx[3]);
    			if (dirty & /*symbol*/ 8) set_data_dev(t7, /*symbol*/ ctx[3]);
    			if (dirty & /*current_price*/ 32 && raw_value !== (raw_value = /*current_price*/ ctx[5].toPrecision(5).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,').replace(/e\+?/, 'E') + "")) html_tag.p(raw_value);
    			if (dirty & /*price_change_percentage_1h_in_currency*/ 2 && t11_value !== (t11_value = /*price_change_percentage_1h_in_currency*/ ctx[1].toPrecision(2) + "")) set_data_dev(t11, t11_value);

    			if (dirty & /*price_change_percentage_1h_in_currency*/ 2) {
    				set_style(p3, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    				? "#66bb6a"
    				: "#f44336");
    			}

    			if (dirty & /*price_change_percentage_24h*/ 1 && t14_value !== (t14_value = /*price_change_percentage_24h*/ ctx[0].toPrecision(2) + "")) set_data_dev(t14, t14_value);

    			if (dirty & /*price_change_percentage_1h_in_currency*/ 2) {
    				set_style(p4, "color", /*price_change_percentage_1h_in_currency*/ ctx[1] > 0
    				? "#66bb6a"
    				: "#f44336");
    			}

    			if (dirty & /*market_cap*/ 64 && t18_value !== (t18_value = /*market_cap*/ ctx[6].toString().replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,') + "")) set_data_dev(t18, t18_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FavouriteCoinDataContainer', slots, []);
    	let { name } = $$props;
    	let { symbol } = $$props;
    	let { image } = $$props;
    	let { current_price } = $$props;
    	let { market_cap } = $$props;
    	let { market_cap_rank } = $$props;
    	let { price_change_percentage_24h } = $$props;
    	let { price_change_percentage_1h_in_currency } = $$props;

    	const writable_props = [
    		'name',
    		'symbol',
    		'image',
    		'current_price',
    		'market_cap',
    		'market_cap_rank',
    		'price_change_percentage_24h',
    		'price_change_percentage_1h_in_currency'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FavouriteCoinDataContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('symbol' in $$props) $$invalidate(3, symbol = $$props.symbol);
    		if ('image' in $$props) $$invalidate(4, image = $$props.image);
    		if ('current_price' in $$props) $$invalidate(5, current_price = $$props.current_price);
    		if ('market_cap' in $$props) $$invalidate(6, market_cap = $$props.market_cap);
    		if ('market_cap_rank' in $$props) $$invalidate(7, market_cap_rank = $$props.market_cap_rank);
    		if ('price_change_percentage_24h' in $$props) $$invalidate(0, price_change_percentage_24h = $$props.price_change_percentage_24h);
    		if ('price_change_percentage_1h_in_currency' in $$props) $$invalidate(1, price_change_percentage_1h_in_currency = $$props.price_change_percentage_1h_in_currency);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		symbol,
    		image,
    		current_price,
    		market_cap,
    		market_cap_rank,
    		price_change_percentage_24h,
    		price_change_percentage_1h_in_currency
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('symbol' in $$props) $$invalidate(3, symbol = $$props.symbol);
    		if ('image' in $$props) $$invalidate(4, image = $$props.image);
    		if ('current_price' in $$props) $$invalidate(5, current_price = $$props.current_price);
    		if ('market_cap' in $$props) $$invalidate(6, market_cap = $$props.market_cap);
    		if ('market_cap_rank' in $$props) $$invalidate(7, market_cap_rank = $$props.market_cap_rank);
    		if ('price_change_percentage_24h' in $$props) $$invalidate(0, price_change_percentage_24h = $$props.price_change_percentage_24h);
    		if ('price_change_percentage_1h_in_currency' in $$props) $$invalidate(1, price_change_percentage_1h_in_currency = $$props.price_change_percentage_1h_in_currency);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*price_change_percentage_1h_in_currency, price_change_percentage_24h*/ 3) {
    			{
    				if (price_change_percentage_1h_in_currency == null) $$invalidate(1, price_change_percentage_1h_in_currency = 0);
    				if (price_change_percentage_24h == null) $$invalidate(0, price_change_percentage_24h = 0);
    			}
    		}
    	};

    	return [
    		price_change_percentage_24h,
    		price_change_percentage_1h_in_currency,
    		name,
    		symbol,
    		image,
    		current_price,
    		market_cap,
    		market_cap_rank
    	];
    }

    class FavouriteCoinDataContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			name: 2,
    			symbol: 3,
    			image: 4,
    			current_price: 5,
    			market_cap: 6,
    			market_cap_rank: 7,
    			price_change_percentage_24h: 0,
    			price_change_percentage_1h_in_currency: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FavouriteCoinDataContainer",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'name'");
    		}

    		if (/*symbol*/ ctx[3] === undefined && !('symbol' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'symbol'");
    		}

    		if (/*image*/ ctx[4] === undefined && !('image' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'image'");
    		}

    		if (/*current_price*/ ctx[5] === undefined && !('current_price' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'current_price'");
    		}

    		if (/*market_cap*/ ctx[6] === undefined && !('market_cap' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'market_cap'");
    		}

    		if (/*market_cap_rank*/ ctx[7] === undefined && !('market_cap_rank' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'market_cap_rank'");
    		}

    		if (/*price_change_percentage_24h*/ ctx[0] === undefined && !('price_change_percentage_24h' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'price_change_percentage_24h'");
    		}

    		if (/*price_change_percentage_1h_in_currency*/ ctx[1] === undefined && !('price_change_percentage_1h_in_currency' in props)) {
    			console.warn("<FavouriteCoinDataContainer> was created without expected prop 'price_change_percentage_1h_in_currency'");
    		}
    	}

    	get name() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get symbol() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set symbol(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current_price() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current_price(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get market_cap() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set market_cap(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get market_cap_rank() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set market_cap_rank(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price_change_percentage_24h() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price_change_percentage_24h(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price_change_percentage_1h_in_currency() {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price_change_percentage_1h_in_currency(value) {
    		throw new Error("<FavouriteCoinDataContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\utils\favouriteCoinAdderMenuContainer.svelte generated by Svelte v3.46.4 */
    const file$3 = "src\\utils\\favouriteCoinAdderMenuContainer.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = text(/*name*/ ctx[1]);
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1kbgpgw");
    			add_location(img, file$3, 35, 8, 1341);
    			attr_dev(span, "class", "svelte-1kbgpgw");
    			add_location(span, file$3, 36, 8, 1375);
    			attr_dev(button, "class", "container svelte-1kbgpgw");
    			add_location(button, file$3, 34, 4, 1284);
    			attr_dev(main, "class", "svelte-1kbgpgw");
    			add_location(main, file$3, 33, 0, 1272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, img);
    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*whenClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 1 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FavouriteCoinAdderMenuContainer', slots, []);
    	let { image } = $$props;
    	let { name } = $$props;
    	let { favouriteCoins } = $$props;
    	let { coinToAdd } = $$props;
    	const dispatcher = createEventDispatcher();

    	const whenClick = () => {
    		dispatcher("AddingCoin");

    		if (coinToAdd != null) {
    			if (!favouriteCoins.includes(coinToAdd)) {
    				let coinIndex = favouriteCoins.findIndex(value => name.toLowerCase() == value.toLowerCase());
    				let newFavouriteCoins = Array.from(favouriteCoins);
    				newFavouriteCoins[coinIndex] = coinToAdd.toLowerCase();

    				fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/favourite-coin", {
    					method: "POST",
    					body: JSON.stringify(newFavouriteCoins),
    					headers: {
    						"Accept": "*/*",
    						"Content-Type": "application/json"
    					}
    				}).then(function (response) {
    					return response.text();
    				}).then(function () {
    					dispatcher("coinAdded", newFavouriteCoins);
    				}).catch(function () {
    					dispatcher("coinNotAdded");
    				});
    			}
    		}
    	};

    	const writable_props = ['image', 'name', 'favouriteCoins', 'coinToAdd'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FavouriteCoinAdderMenuContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('image' in $$props) $$invalidate(0, image = $$props.image);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('favouriteCoins' in $$props) $$invalidate(3, favouriteCoins = $$props.favouriteCoins);
    		if ('coinToAdd' in $$props) $$invalidate(4, coinToAdd = $$props.coinToAdd);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		image,
    		name,
    		favouriteCoins,
    		coinToAdd,
    		dispatcher,
    		whenClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('image' in $$props) $$invalidate(0, image = $$props.image);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('favouriteCoins' in $$props) $$invalidate(3, favouriteCoins = $$props.favouriteCoins);
    		if ('coinToAdd' in $$props) $$invalidate(4, coinToAdd = $$props.coinToAdd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, name, whenClick, favouriteCoins, coinToAdd];
    }

    class FavouriteCoinAdderMenuContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			image: 0,
    			name: 1,
    			favouriteCoins: 3,
    			coinToAdd: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FavouriteCoinAdderMenuContainer",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[0] === undefined && !('image' in props)) {
    			console.warn("<FavouriteCoinAdderMenuContainer> was created without expected prop 'image'");
    		}

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<FavouriteCoinAdderMenuContainer> was created without expected prop 'name'");
    		}

    		if (/*favouriteCoins*/ ctx[3] === undefined && !('favouriteCoins' in props)) {
    			console.warn("<FavouriteCoinAdderMenuContainer> was created without expected prop 'favouriteCoins'");
    		}

    		if (/*coinToAdd*/ ctx[4] === undefined && !('coinToAdd' in props)) {
    			console.warn("<FavouriteCoinAdderMenuContainer> was created without expected prop 'coinToAdd'");
    		}
    	}

    	get image() {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get favouriteCoins() {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favouriteCoins(value) {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get coinToAdd() {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set coinToAdd(value) {
    		throw new Error("<FavouriteCoinAdderMenuContainer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\tabs\favourite.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1$1, Map: Map_1 } = globals;
    const file$2 = "src\\components\\tabs\\favourite.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	child_ctx[42] = i;
    	return child_ctx;
    }

    // (315:59) 
    function create_if_block_3$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_4$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (!/*hasResponseError*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "loading-spinner svelte-7dhrbh");
    			add_location(div, file$2, 315, 8, 14967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(315:59) ",
    		ctx
    	});

    	return block;
    }

    // (243:4) {#if hasLoadedData && $currentTab == "favourite"}
    function create_if_block$2(ctx) {
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let span0;
    	let t2;
    	let div1;
    	let span1;
    	let t3_value = /*infoPageData*/ ctx[10].message + "";
    	let t3;
    	let t4;
    	let button0;
    	let svg;
    	let path0;
    	let path1;
    	let t5;
    	let div7;
    	let div4;
    	let div2;
    	let span2;
    	let t7;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let t8;
    	let header;
    	let div6;
    	let div5;
    	let p0;
    	let t10;
    	let p1;
    	let t12;
    	let p2;
    	let t14;
    	let p3;
    	let t16;
    	let p4;
    	let t18;
    	let p5;
    	let t20;
    	let footer;
    	let current_block_type_index;
    	let if_block;
    	let t21;
    	let button1;
    	let img1;
    	let img1_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*favouriteCoinAdderMenuReactive*/ ctx[13];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*coinData*/ ctx[40].symbol;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const if_block_creators = [create_if_block_1$2, create_if_block_2$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*showTab*/ ctx[5] == "coin") return 0;
    		if (/*showTab*/ ctx[5] == "favourite coin") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "No coin found";
    			t2 = space();
    			div1 = element("div");
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			button0 = element("button");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t5 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			span2 = element("span");
    			span2.textContent = "Replace with";
    			t7 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			header = element("header");
    			div6 = element("div");
    			div5 = element("div");
    			p0 = element("p");
    			p0.textContent = "#";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "Coin";
    			t12 = space();
    			p2 = element("p");
    			p2.textContent = "Price";
    			t14 = space();
    			p3 = element("p");
    			p3.textContent = "1h%";
    			t16 = space();
    			p4 = element("p");
    			p4.textContent = "24h%";
    			t18 = space();
    			p5 = element("p");
    			p5.textContent = "Mkt cap";
    			t20 = space();
    			footer = element("footer");
    			if (if_block) if_block.c();
    			t21 = space();
    			button1 = element("button");
    			img1 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = "./img/coin.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "no coin");
    			attr_dev(img0, "class", "svelte-7dhrbh");
    			add_location(img0, file$2, 244, 12, 11137);
    			attr_dev(span0, "class", "svelte-7dhrbh");
    			add_location(span0, file$2, 245, 12, 11191);
    			attr_dev(div0, "class", "no-coin-page svelte-7dhrbh");

    			set_style(
    				div0,
    				"display",
    				/*showTab*/ ctx[5] == "coin" && /*coinListReactive*/ ctx[11].length > 0
    				? "none"
    				: /*showTab*/ ctx[5] == "favourite coin" && /*favouriteCoinListReactive*/ ctx[12].length > 0
    					? "none"
    					: "flex",
    				false
    			);

    			add_location(div0, file$2, 243, 8, 10930);
    			attr_dev(span1, "class", "svelte-7dhrbh");
    			add_location(span1, file$2, 248, 12, 11331);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "d", "M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z");
    			add_location(path0, file$2, 253, 20, 11614);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z");
    			add_location(path1, file$2, 254, 20, 11752);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "fill", "white");
    			attr_dev(svg, "class", "bi bi-x");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			add_location(svg, file$2, 252, 16, 11480);
    			attr_dev(button0, "class", "svelte-7dhrbh");
    			add_location(button0, file$2, 251, 12, 11412);
    			attr_dev(div1, "class", "info-tab svelte-7dhrbh");
    			set_style(div1, "display", /*infoPageData*/ ctx[10].show ? "flex" : "none", false);
    			add_location(div1, file$2, 247, 8, 11243);
    			attr_dev(span2, "class", "svelte-7dhrbh");
    			add_location(span2, file$2, 261, 20, 12390);
    			attr_dev(div2, "class", "header svelte-7dhrbh");
    			add_location(div2, file$2, 260, 16, 12348);
    			attr_dev(div3, "class", "footer svelte-7dhrbh");
    			add_location(div3, file$2, 265, 16, 12505);
    			attr_dev(div4, "class", "fav-coin-adder-menu svelte-7dhrbh");

    			set_style(
    				div4,
    				"display",
    				/*shouldShowFavouriteCoinAdderMenu*/ ctx[8]
    				? "block"
    				: "none",
    				false
    			);

    			add_location(div4, file$2, 259, 12, 12195);
    			attr_dev(p0, "id", "rank");
    			attr_dev(p0, "class", "svelte-7dhrbh");
    			add_location(p0, file$2, 290, 24, 13801);
    			attr_dev(p1, "id", "name");
    			attr_dev(p1, "class", "svelte-7dhrbh");
    			add_location(p1, file$2, 291, 24, 13845);
    			attr_dev(div5, "class", "fixed-head svelte-7dhrbh");
    			add_location(div5, file$2, 289, 20, 13751);
    			attr_dev(p2, "id", "price");
    			attr_dev(p2, "class", "svelte-7dhrbh");
    			add_location(p2, file$2, 293, 20, 13916);
    			attr_dev(p3, "id", "change");
    			attr_dev(p3, "class", "svelte-7dhrbh");
    			add_location(p3, file$2, 294, 20, 13961);
    			attr_dev(p4, "id", "change");
    			attr_dev(p4, "class", "svelte-7dhrbh");
    			add_location(p4, file$2, 295, 20, 14005);
    			attr_dev(p5, "id", "mkt-cap");
    			attr_dev(p5, "class", "svelte-7dhrbh");
    			add_location(p5, file$2, 296, 20, 14050);
    			attr_dev(div6, "class", "head svelte-7dhrbh");
    			add_location(div6, file$2, 288, 16, 13711);
    			attr_dev(header, "class", "svelte-7dhrbh");
    			add_location(header, file$2, 287, 12, 13685);
    			attr_dev(footer, "class", "svelte-7dhrbh");
    			add_location(footer, file$2, 299, 12, 14138);
    			attr_dev(div7, "class", "table-body svelte-7dhrbh");

    			set_style(
    				div7,
    				"display",
    				/*showTab*/ ctx[5] == "coin" && /*coinListReactive*/ ctx[11].length > 0
    				? "block"
    				: /*showTab*/ ctx[5] == "favourite coin" && /*favouriteCoinListReactive*/ ctx[12].length > 0
    					? "block"
    					: "none",
    				false
    			);

    			add_location(div7, file$2, 258, 8, 11940);

    			if (!src_url_equal(img1.src, img1_src_value = /*showTab*/ ctx[5] == "coin"
    			? "./img/star-fill.svg"
    			: "./img/coin.svg")) attr_dev(img1, "src", img1_src_value);

    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-7dhrbh");
    			add_location(img1, file$2, 312, 12, 14798);
    			attr_dev(button1, "id", "set");
    			attr_dev(button1, "class", "svelte-7dhrbh");
    			add_location(button1, file$2, 311, 8, 14695);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span1);
    			append_dev(span1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button0);
    			append_dev(button0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div4);
    			append_dev(div4, div2);
    			append_dev(div2, span2);
    			append_dev(div4, t7);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			/*div4_binding*/ ctx[29](div4);
    			append_dev(div7, t8);
    			append_dev(div7, header);
    			append_dev(header, div6);
    			append_dev(div6, div5);
    			append_dev(div5, p0);
    			append_dev(div5, t10);
    			append_dev(div5, p1);
    			append_dev(div6, t12);
    			append_dev(div6, p2);
    			append_dev(div6, t14);
    			append_dev(div6, p3);
    			append_dev(div6, t16);
    			append_dev(div6, p4);
    			append_dev(div6, t18);
    			append_dev(div6, p5);
    			append_dev(div7, t20);
    			append_dev(div7, footer);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(footer, null);
    			}

    			/*div7_binding*/ ctx[30](div7);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, img1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[24], false, false, false),
    					listen_dev(div7, "scroll", /*whenScrolled*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[31], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*showTab, coinListReactive, favouriteCoinListReactive*/ 6176) {
    				set_style(
    					div0,
    					"display",
    					/*showTab*/ ctx[5] == "coin" && /*coinListReactive*/ ctx[11].length > 0
    					? "none"
    					: /*showTab*/ ctx[5] == "favourite coin" && /*favouriteCoinListReactive*/ ctx[12].length > 0
    						? "none"
    						: "flex",
    					false
    				);
    			}

    			if ((!current || dirty[0] & /*infoPageData*/ 1024) && t3_value !== (t3_value = /*infoPageData*/ ctx[10].message + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*infoPageData*/ 1024) {
    				set_style(div1, "display", /*infoPageData*/ ctx[10].show ? "flex" : "none", false);
    			}

    			if (dirty[0] & /*favouriteCoinAdderMenuReactive, coinToAdd, favouriteCoins, whenCoinAdded, infoPageData, shouldShowFavouriteCoinAdderMenu*/ 141060) {
    				each_value_2 = /*favouriteCoinAdderMenuReactive*/ ctx[13];
    				validate_each_argument(each_value_2);
    				group_outros();
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div3, outro_and_destroy_block, create_each_block_2, null, get_each_context_2);
    				check_outros();
    			}

    			if (dirty[0] & /*shouldShowFavouriteCoinAdderMenu*/ 256) {
    				set_style(
    					div4,
    					"display",
    					/*shouldShowFavouriteCoinAdderMenu*/ ctx[8]
    					? "block"
    					: "none",
    					false
    				);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(footer, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty[0] & /*showTab, coinListReactive, favouriteCoinListReactive*/ 6176) {
    				set_style(
    					div7,
    					"display",
    					/*showTab*/ ctx[5] == "coin" && /*coinListReactive*/ ctx[11].length > 0
    					? "block"
    					: /*showTab*/ ctx[5] == "favourite coin" && /*favouriteCoinListReactive*/ ctx[12].length > 0
    						? "block"
    						: "none",
    					false
    				);
    			}

    			if (!current || dirty[0] & /*showTab*/ 32 && !src_url_equal(img1.src, img1_src_value = /*showTab*/ ctx[5] == "coin"
    			? "./img/star-fill.svg"
    			: "./img/coin.svg")) {
    				attr_dev(img1, "src", img1_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div4_binding*/ ctx[29](null);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div7_binding*/ ctx[30](null);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(243:4) {#if hasLoadedData && $currentTab == \\\"favourite\\\"}",
    		ctx
    	});

    	return block;
    }

    // (319:12) {:else}
    function create_else_block$2(ctx) {
    	let noconnectionpage;
    	let current;
    	noconnectionpage = new NoConnectionPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(noconnectionpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(noconnectionpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noconnectionpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noconnectionpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(noconnectionpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(319:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (317:12) {#if !hasResponseError}
    function create_if_block_4$2(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 90, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(317:12) {#if !hasResponseError}",
    		ctx
    	});

    	return block;
    }

    // (267:20) {#each favouriteCoinAdderMenuReactive as coinData, idx (coinData.symbol)}
    function create_each_block_2(key_1, ctx) {
    	let first;
    	let favouritecoinaddermenucontainer;
    	let updating_coinToAdd;
    	let updating_favouriteCoins;
    	let current;

    	function favouritecoinaddermenucontainer_coinToAdd_binding(value) {
    		/*favouritecoinaddermenucontainer_coinToAdd_binding*/ ctx[25](value);
    	}

    	function favouritecoinaddermenucontainer_favouriteCoins_binding(value) {
    		/*favouritecoinaddermenucontainer_favouriteCoins_binding*/ ctx[26](value);
    	}

    	let favouritecoinaddermenucontainer_props = {
    		name: /*coinData*/ ctx[40].name,
    		image: /*coinData*/ ctx[40].image
    	};

    	if (/*coinToAdd*/ ctx[9] !== void 0) {
    		favouritecoinaddermenucontainer_props.coinToAdd = /*coinToAdd*/ ctx[9];
    	}

    	if (/*favouriteCoins*/ ctx[2] !== void 0) {
    		favouritecoinaddermenucontainer_props.favouriteCoins = /*favouriteCoins*/ ctx[2];
    	}

    	favouritecoinaddermenucontainer = new FavouriteCoinAdderMenuContainer({
    			props: favouritecoinaddermenucontainer_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(favouritecoinaddermenucontainer, 'coinToAdd', favouritecoinaddermenucontainer_coinToAdd_binding));
    	binding_callbacks.push(() => bind(favouritecoinaddermenucontainer, 'favouriteCoins', favouritecoinaddermenucontainer_favouriteCoins_binding));
    	favouritecoinaddermenucontainer.$on("coinAdded", /*whenCoinAdded*/ ctx[17]);
    	favouritecoinaddermenucontainer.$on("coinNotAdded", /*coinNotAdded_handler*/ ctx[27]);
    	favouritecoinaddermenucontainer.$on("AddingCoin", /*AddingCoin_handler*/ ctx[28]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(favouritecoinaddermenucontainer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(favouritecoinaddermenucontainer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const favouritecoinaddermenucontainer_changes = {};
    			if (dirty[0] & /*favouriteCoinAdderMenuReactive*/ 8192) favouritecoinaddermenucontainer_changes.name = /*coinData*/ ctx[40].name;
    			if (dirty[0] & /*favouriteCoinAdderMenuReactive*/ 8192) favouritecoinaddermenucontainer_changes.image = /*coinData*/ ctx[40].image;

    			if (!updating_coinToAdd && dirty[0] & /*coinToAdd*/ 512) {
    				updating_coinToAdd = true;
    				favouritecoinaddermenucontainer_changes.coinToAdd = /*coinToAdd*/ ctx[9];
    				add_flush_callback(() => updating_coinToAdd = false);
    			}

    			if (!updating_favouriteCoins && dirty[0] & /*favouriteCoins*/ 4) {
    				updating_favouriteCoins = true;
    				favouritecoinaddermenucontainer_changes.favouriteCoins = /*favouriteCoins*/ ctx[2];
    				add_flush_callback(() => updating_favouriteCoins = false);
    			}

    			favouritecoinaddermenucontainer.$set(favouritecoinaddermenucontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(favouritecoinaddermenucontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(favouritecoinaddermenucontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(favouritecoinaddermenucontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(267:20) {#each favouriteCoinAdderMenuReactive as coinData, idx (coinData.symbol)}",
    		ctx
    	});

    	return block;
    }

    // (305:55) 
    function create_if_block_2$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*favouriteCoinListReactive*/ ctx[12];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*coinData*/ ctx[40].symbol;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*favouriteCoinListReactive*/ 4096) {
    				each_value_1 = /*favouriteCoinListReactive*/ ctx[12];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(305:55) ",
    		ctx
    	});

    	return block;
    }

    // (301:16) {#if showTab == "coin"}
    function create_if_block_1$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let each_1_anchor;
    	let current;
    	let each_value = /*coinListReactive*/ ctx[11];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*coinData*/ ctx[40].symbol;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*coinListReactive, toAddCoin*/ 67584) {
    				each_value = /*coinListReactive*/ ctx[11];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(301:16) {#if showTab == \\\"coin\\\"}",
    		ctx
    	});

    	return block;
    }

    // (306:20) {#each favouriteCoinListReactive as coinData, idx (coinData.symbol)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let favouritecoindatacontainer;
    	let current;
    	const favouritecoindatacontainer_spread_levels = [/*coinData*/ ctx[40]];
    	let favouritecoindatacontainer_props = {};

    	for (let i = 0; i < favouritecoindatacontainer_spread_levels.length; i += 1) {
    		favouritecoindatacontainer_props = assign(favouritecoindatacontainer_props, favouritecoindatacontainer_spread_levels[i]);
    	}

    	favouritecoindatacontainer = new FavouriteCoinDataContainer({
    			props: favouritecoindatacontainer_props,
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(favouritecoindatacontainer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(favouritecoindatacontainer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const favouritecoindatacontainer_changes = (dirty[0] & /*favouriteCoinListReactive*/ 4096)
    			? get_spread_update(favouritecoindatacontainer_spread_levels, [get_spread_object(/*coinData*/ ctx[40])])
    			: {};

    			favouritecoindatacontainer.$set(favouritecoindatacontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(favouritecoindatacontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(favouritecoindatacontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(favouritecoindatacontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(306:20) {#each favouriteCoinListReactive as coinData, idx (coinData.symbol)}",
    		ctx
    	});

    	return block;
    }

    // (302:20) {#each coinListReactive as coinData, idx (coinData.symbol)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let coindatacontainer;
    	let current;
    	const coindatacontainer_spread_levels = [/*coinData*/ ctx[40]];
    	let coindatacontainer_props = {};

    	for (let i = 0; i < coindatacontainer_spread_levels.length; i += 1) {
    		coindatacontainer_props = assign(coindatacontainer_props, coindatacontainer_spread_levels[i]);
    	}

    	coindatacontainer = new CoinDataContainer({
    			props: coindatacontainer_props,
    			$$inline: true
    		});

    	coindatacontainer.$on("toadd", /*toAddCoin*/ ctx[16]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(coindatacontainer.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(coindatacontainer, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const coindatacontainer_changes = (dirty[0] & /*coinListReactive*/ 2048)
    			? get_spread_update(coindatacontainer_spread_levels, [get_spread_object(/*coinData*/ ctx[40])])
    			: {};

    			coindatacontainer.$set(coindatacontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coindatacontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coindatacontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(coindatacontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(302:20) {#each coinListReactive as coinData, idx (coinData.symbol)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let nav;
    	let div;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let input;
    	let input_placeholder_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_if_block_3$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hasLoadedData*/ ctx[4] && /*$currentTab*/ ctx[1] == "favourite") return 0;
    		if (!/*hasLoadedData*/ ctx[4] && /*$currentTab*/ ctx[1] == "favourite") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav = element("nav");
    			div = element("div");
    			img0 = element("img");
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(img0, "id", "back-btn");
    			if (!src_url_equal(img0.src, img0_src_value = "./img/arrow-left-short.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-7dhrbh");
    			add_location(img0, file$2, 233, 12, 10372);
    			attr_dev(input, "type", "text");

    			attr_dev(input, "placeholder", input_placeholder_value = /*showTab*/ ctx[5] == "coin"
    			? "Search coins"
    			: "Search favourite coins");

    			attr_dev(input, "class", "svelte-7dhrbh");
    			add_location(input, file$2, 237, 12, 10558);
    			attr_dev(img1, "id", "exit");
    			if (!src_url_equal(img1.src, img1_src_value = "./img/x.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-7dhrbh");
    			set_style(img1, "display", /*searchValue*/ ctx[0].length > 0 ? "block" : "none", false);
    			add_location(img1, file$2, 238, 12, 10692);
    			attr_dev(div, "class", "container svelte-7dhrbh");
    			add_location(div, file$2, 232, 8, 10335);
    			attr_dev(nav, "class", "svelte-7dhrbh");
    			add_location(nav, file$2, 231, 4, 10320);
    			attr_dev(main, "class", "svelte-7dhrbh");
    			set_style(main, "display", /*$currentTab*/ ctx[1] == "favourite" ? "block" : "none", false);
    			add_location(main, file$2, 230, 0, 10247);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, div);
    			append_dev(div, img0);
    			append_dev(div, t0);
    			append_dev(div, input);
    			set_input_value(input, /*searchValue*/ ctx[0]);
    			append_dev(div, t1);
    			append_dev(div, img1);
    			append_dev(main, t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[22]),
    					listen_dev(img1, "click", /*click_handler_1*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*showTab*/ 32 && input_placeholder_value !== (input_placeholder_value = /*showTab*/ ctx[5] == "coin"
    			? "Search coins"
    			: "Search favourite coins")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty[0] & /*searchValue*/ 1 && input.value !== /*searchValue*/ ctx[0]) {
    				set_input_value(input, /*searchValue*/ ctx[0]);
    			}

    			if (dirty[0] & /*searchValue*/ 1) {
    				set_style(img1, "display", /*searchValue*/ ctx[0].length > 0 ? "block" : "none", false);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty[0] & /*$currentTab*/ 2) {
    				set_style(main, "display", /*$currentTab*/ ctx[1] == "favourite" ? "block" : "none", false);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let favouriteCoinAdderMenuReactive;
    	let favouriteCoinListReactive;
    	let coinListReactive;
    	let $currentTab;
    	let $lastTab;
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(1, $currentTab = $$value));
    	validate_store(lastTab, 'lastTab');
    	component_subscribe($$self, lastTab, $$value => $$invalidate(14, $lastTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Favourite', slots, []);
    	let coinList = Array();
    	let favouriteCoins = Array();
    	let favouriteCoinList = Array();
    	let minCoinLength = 100;
    	let maxCoinLength = 1000;
    	let coinLength = 100;
    	var lastScrollTop = 0;
    	let searchValue = String();
    	let isLoading = false;
    	let hasResponseError = false;
    	let hasLoadedData = false;
    	let showTab = "coin";
    	let favouriteCoinAdderMenu = null;
    	let tableBody = null;
    	let shouldShowFavouriteCoinAdderMenu = false;
    	let isAdding = false;
    	let coinToAdd = null;
    	let infoPageData = { message: "Bitcoin", show: false };

    	const updateData = () => {
    		if ($currentTab == "favourite" && hasLoadedData) {
    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/favourite-coin-data", {
    				method: "GET",
    				headers: {
    					"Accept": "*/*",
    					"Content-Type": "application/json"
    				}
    			}).then(function (response) {
    				return response.json();
    			}).then(function (data) {
    				if (data.state == "success") {
    					if (data.data["coin list"].length > 0) {
    						$$invalidate(19, favouriteCoinList = data.data["favourite coin list"].map(value => ({
    							name: value["name"],
    							symbol: value["symbol"],
    							image: value["image"],
    							current_price: value["current_price"],
    							market_cap: value["market_cap"],
    							market_cap_rank: value["market_cap_rank"],
    							price_change_percentage_24h: value["price_change_percentage_24h"],
    							price_change_percentage_1h_in_currency: value["price_change_percentage_1h_in_currency"]
    						})));

    						$$invalidate(18, coinList = data.data["coin list"].map(value => ({
    							name: value["name"],
    							symbol: value["symbol"],
    							image: value["image"],
    							current_price: value["current_price"],
    							market_cap: value["market_cap"],
    							market_cap_rank: value["market_cap_rank"],
    							price_change_percentage_24h: value["price_change_percentage_24h"],
    							price_change_percentage_1h_in_currency: value["price_change_percentage_1h_in_currency"],
    							is_add_to_favourite: value["is_add_to_favourite"]
    						})));

    						$$invalidate(2, favouriteCoins = data.data["favourite coin list"].map(value => value["name"].toLowerCase()));
    					}
    				}
    			});
    		}
    	};

    	const loadData = () => {
    		if (!hasLoadedData) {
    			isLoading = true;

    			fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/favourite-coin-data", {
    				method: "GET",
    				headers: {
    					"Accept": "*/*",
    					"Content-Type": "application/json"
    				}
    			}).then(function (response) {
    				return response.json();
    			}).then(function (data) {
    				if (data.state == "success") {
    					$$invalidate(4, hasLoadedData = true);
    					$$invalidate(3, hasResponseError = false);
    					isLoading = false;

    					$$invalidate(19, favouriteCoinList = data.data["favourite coin list"].map(value => ({
    						name: value["name"],
    						symbol: value["symbol"],
    						image: value["image"],
    						current_price: value["current_price"],
    						market_cap: value["market_cap"],
    						market_cap_rank: value["market_cap_rank"],
    						price_change_percentage_24h: value["price_change_percentage_24h"],
    						price_change_percentage_1h_in_currency: value["price_change_percentage_1h_in_currency"]
    					})));

    					$$invalidate(18, coinList = data.data["coin list"].map(value => ({
    						name: value["name"],
    						symbol: value["symbol"],
    						image: value["image"],
    						current_price: value["current_price"],
    						market_cap: value["market_cap"],
    						market_cap_rank: value["market_cap_rank"],
    						price_change_percentage_24h: value["price_change_percentage_24h"],
    						price_change_percentage_1h_in_currency: value["price_change_percentage_1h_in_currency"],
    						is_add_to_favourite: value["is_add_to_favourite"]
    					})));

    					$$invalidate(2, favouriteCoins = data.data["favourite coin list"].map(value => value["name"].toLowerCase()));
    				} else {
    					throw new Error();
    				}
    			}).catch(_ => {
    				isLoading = false;
    				$$invalidate(3, hasResponseError = true);
    				$$invalidate(4, hasLoadedData = false);
    			});
    		} else {
    			$$invalidate(4, hasLoadedData = false);
    			$$invalidate(3, hasResponseError = false);
    			isLoading = false;
    		}
    	};

    	const loadDataWhenOnline = () => {
    		if (!hasLoadedData && window.navigator.onLine && hasResponseError) $$invalidate(3, hasResponseError = false);
    		if ($currentTab == "favourite" && !isLoading && window.navigator.onLine && !hasLoadedData) loadData();
    		requestAnimationFrame(loadDataWhenOnline);
    	};

    	requestAnimationFrame(loadDataWhenOnline);

    	onMount(() => {
    		loadData();

    		setInterval(
    			() => {
    				updateData();
    			},
    			300000
    		);
    	});

    	const whenScrolled = ev => {
    		if (shouldShowFavouriteCoinAdderMenu) {
    			$$invalidate(8, shouldShowFavouriteCoinAdderMenu = false);
    		}

    		var st = ev.target.scrollTop;

    		if (st > lastScrollTop) {
    			$$invalidate(20, coinLength += 0.5);
    			$$invalidate(20, coinLength = Math.round(coinLength));
    			$$invalidate(20, coinLength = coinLength >= maxCoinLength ? maxCoinLength : coinLength);
    		} else {
    			$$invalidate(20, coinLength -= 1);
    			$$invalidate(20, coinLength = coinLength <= minCoinLength ? minCoinLength : coinLength);
    		}

    		lastScrollTop = lastScrollTop = st <= 0 ? 0 : st;
    	};

    	window.addEventListener("contextmenu", () => {
    		if (shouldShowFavouriteCoinAdderMenu) {
    			$$invalidate(8, shouldShowFavouriteCoinAdderMenu = false);
    		}
    	});

    	window.addEventListener("click", e => {
    		if ($currentTab == "favourite" && favouriteCoinAdderMenu != null && shouldShowFavouriteCoinAdderMenu) {
    			let target = e.target;

    			if (!isAdding && !(target.isSameNode(favouriteCoinAdderMenu) || favouriteCoinAdderMenu.contains(target))) {
    				$$invalidate(8, shouldShowFavouriteCoinAdderMenu = false);
    			}

    			isAdding = false;
    		}
    	});

    	const toAddCoin = e => {
    		if (favouriteCoinAdderMenu != null && tableBody != null) {
    			$$invalidate(6, favouriteCoinAdderMenu.style.left = `${e.detail.x}px`, favouriteCoinAdderMenu);
    			let height = e.detail.y + tableBody.scrollTop;
    			let scrollheight = tableBody.offsetHeight + tableBody.scrollTop;
    			if (height + 376 >= scrollheight) $$invalidate(6, favouriteCoinAdderMenu.style.top = `${height - 306}px`, favouriteCoinAdderMenu); else $$invalidate(6, favouriteCoinAdderMenu.style.top = `${height}px`, favouriteCoinAdderMenu);
    			$$invalidate(8, shouldShowFavouriteCoinAdderMenu = true);
    			isAdding = true;
    			$$invalidate(9, coinToAdd = e.detail.name);
    		}
    	};

    	const whenCoinAdded = e => {
    		$$invalidate(2, favouriteCoins = e.detail);

    		$$invalidate(18, coinList = coinList.map(value => ({
    			name: value["name"],
    			symbol: value["symbol"],
    			image: value["image"],
    			current_price: value["current_price"],
    			market_cap: value["market_cap"],
    			market_cap_rank: value["market_cap_rank"],
    			price_change_percentage_24h: value["price_change_percentage_24h"],
    			price_change_percentage_1h_in_currency: value["price_change_percentage_1h_in_currency"],
    			is_add_to_favourite: favouriteCoins.includes(value["name"].toLowerCase())
    		})));

    		let favouriteCoinListMap = new Map();

    		coinList.filter(value => favouriteCoins.includes(value.name.toLowerCase())).map(value => ({
    			name: value["name"],
    			symbol: value["symbol"],
    			image: value["image"],
    			current_price: value["current_price"],
    			market_cap: value["market_cap"],
    			market_cap_rank: value["market_cap_rank"],
    			price_change_percentage_24h: value["price_change_percentage_24h"],
    			price_change_percentage_1h_in_currency: value["price_change_percentage_1h_in_currency"]
    		})).forEach(value => {
    			favouriteCoinListMap.set(value.name.toLowerCase(), value);
    		});

    		$$invalidate(19, favouriteCoinList = []);

    		favouriteCoins.forEach(value => {
    			favouriteCoinList.push(favouriteCoinListMap.get(value.toLowerCase()));
    		});

    		$$invalidate(2, favouriteCoins = favouriteCoinList.map(({ name }) => name.toLocaleLowerCase()));
    		$$invalidate(10, infoPageData.message = `${infoPageData.message} added to favourite`, infoPageData);
    		$$invalidate(10, infoPageData.show = true, infoPageData);
    		setTimeout(() => $$invalidate(10, infoPageData.show = false, infoPageData), 2450);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Favourite> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => {
    		set_store_value(currentTab, $currentTab = $lastTab, $currentTab);
    		set_store_value(lastTab, $lastTab = "favourite", $lastTab);
    	};

    	function input_input_handler() {
    		searchValue = this.value;
    		($$invalidate(0, searchValue), $$invalidate(1, $currentTab));
    	}

    	const click_handler_1 = _ => $$invalidate(0, searchValue = String());
    	const click_handler_2 = _ => $$invalidate(10, infoPageData.show = false, infoPageData);

    	function favouritecoinaddermenucontainer_coinToAdd_binding(value) {
    		coinToAdd = value;
    		$$invalidate(9, coinToAdd);
    	}

    	function favouritecoinaddermenucontainer_favouriteCoins_binding(value) {
    		favouriteCoins = value;
    		$$invalidate(2, favouriteCoins);
    	}

    	const coinNotAdded_handler = _ => {
    		$$invalidate(10, infoPageData.message = `Couldn't add ${infoPageData.message} to favourite`, infoPageData);
    		$$invalidate(10, infoPageData.show = true, infoPageData);
    		setTimeout(() => $$invalidate(10, infoPageData.show = false, infoPageData), 2450);
    	};

    	const AddingCoin_handler = _ => {
    		$$invalidate(10, infoPageData.message = coinToAdd, infoPageData);
    		$$invalidate(8, shouldShowFavouriteCoinAdderMenu = false);
    		$$invalidate(9, coinToAdd = null);
    	};

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			favouriteCoinAdderMenu = $$value;
    			$$invalidate(6, favouriteCoinAdderMenu);
    		});
    	}

    	function div7_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			tableBody = $$value;
    			$$invalidate(7, tableBody);
    		});
    	}

    	const click_handler_3 = _ => $$invalidate(5, showTab = showTab == "coin" ? "favourite coin" : "coin");

    	$$self.$capture_state = () => ({
    		onMount,
    		Circle,
    		currentTab,
    		lastTab,
    		CoinDataContainer,
    		FavouriteCoinDataContainer,
    		FavouriteCoinAdderMenuContainer,
    		NoConnectionPage,
    		coinList,
    		favouriteCoins,
    		favouriteCoinList,
    		minCoinLength,
    		maxCoinLength,
    		coinLength,
    		lastScrollTop,
    		searchValue,
    		isLoading,
    		hasResponseError,
    		hasLoadedData,
    		showTab,
    		favouriteCoinAdderMenu,
    		tableBody,
    		shouldShowFavouriteCoinAdderMenu,
    		isAdding,
    		coinToAdd,
    		infoPageData,
    		updateData,
    		loadData,
    		loadDataWhenOnline,
    		whenScrolled,
    		toAddCoin,
    		whenCoinAdded,
    		coinListReactive,
    		favouriteCoinListReactive,
    		favouriteCoinAdderMenuReactive,
    		$currentTab,
    		$lastTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('coinList' in $$props) $$invalidate(18, coinList = $$props.coinList);
    		if ('favouriteCoins' in $$props) $$invalidate(2, favouriteCoins = $$props.favouriteCoins);
    		if ('favouriteCoinList' in $$props) $$invalidate(19, favouriteCoinList = $$props.favouriteCoinList);
    		if ('minCoinLength' in $$props) minCoinLength = $$props.minCoinLength;
    		if ('maxCoinLength' in $$props) maxCoinLength = $$props.maxCoinLength;
    		if ('coinLength' in $$props) $$invalidate(20, coinLength = $$props.coinLength);
    		if ('lastScrollTop' in $$props) lastScrollTop = $$props.lastScrollTop;
    		if ('searchValue' in $$props) $$invalidate(0, searchValue = $$props.searchValue);
    		if ('isLoading' in $$props) isLoading = $$props.isLoading;
    		if ('hasResponseError' in $$props) $$invalidate(3, hasResponseError = $$props.hasResponseError);
    		if ('hasLoadedData' in $$props) $$invalidate(4, hasLoadedData = $$props.hasLoadedData);
    		if ('showTab' in $$props) $$invalidate(5, showTab = $$props.showTab);
    		if ('favouriteCoinAdderMenu' in $$props) $$invalidate(6, favouriteCoinAdderMenu = $$props.favouriteCoinAdderMenu);
    		if ('tableBody' in $$props) $$invalidate(7, tableBody = $$props.tableBody);
    		if ('shouldShowFavouriteCoinAdderMenu' in $$props) $$invalidate(8, shouldShowFavouriteCoinAdderMenu = $$props.shouldShowFavouriteCoinAdderMenu);
    		if ('isAdding' in $$props) isAdding = $$props.isAdding;
    		if ('coinToAdd' in $$props) $$invalidate(9, coinToAdd = $$props.coinToAdd);
    		if ('infoPageData' in $$props) $$invalidate(10, infoPageData = $$props.infoPageData);
    		if ('coinListReactive' in $$props) $$invalidate(11, coinListReactive = $$props.coinListReactive);
    		if ('favouriteCoinListReactive' in $$props) $$invalidate(12, favouriteCoinListReactive = $$props.favouriteCoinListReactive);
    		if ('favouriteCoinAdderMenuReactive' in $$props) $$invalidate(13, favouriteCoinAdderMenuReactive = $$props.favouriteCoinAdderMenuReactive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$currentTab*/ 2) {
    			{
    				if ($currentTab != "favourite") {
    					$$invalidate(0, searchValue = String());
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*favouriteCoinList*/ 524288) {
    			$$invalidate(13, favouriteCoinAdderMenuReactive = [
    				...Array.from(favouriteCoinList).map(({ image, name, symbol }) => ({ image, name, symbol }))
    			]);
    		}

    		if ($$self.$$.dirty[0] & /*favouriteCoinList, coinLength, searchValue*/ 1572865) {
    			$$invalidate(12, favouriteCoinListReactive = [
    				...Array.from(favouriteCoinList).splice(0, coinLength).filter(value => value.name.toLowerCase().search(searchValue.replaceAll("\\", "").toLowerCase()) >= 0 || value.symbol.toLowerCase().search(searchValue.replaceAll("\\", "").toLowerCase()) >= 0)
    			]);
    		}

    		if ($$self.$$.dirty[0] & /*coinList, coinLength, searchValue*/ 1310721) {
    			$$invalidate(11, coinListReactive = [
    				...Array.from(coinList).splice(0, coinLength).filter(value => value.name.toLowerCase().search(searchValue.replaceAll("\\", "").toLowerCase()) >= 0 || value.symbol.toLowerCase().search(searchValue.replaceAll("\\", "").toLowerCase()) >= 0)
    			]);
    		}
    	};

    	{
    		loadData();
    	}

    	return [
    		searchValue,
    		$currentTab,
    		favouriteCoins,
    		hasResponseError,
    		hasLoadedData,
    		showTab,
    		favouriteCoinAdderMenu,
    		tableBody,
    		shouldShowFavouriteCoinAdderMenu,
    		coinToAdd,
    		infoPageData,
    		coinListReactive,
    		favouriteCoinListReactive,
    		favouriteCoinAdderMenuReactive,
    		$lastTab,
    		whenScrolled,
    		toAddCoin,
    		whenCoinAdded,
    		coinList,
    		favouriteCoinList,
    		coinLength,
    		click_handler,
    		input_input_handler,
    		click_handler_1,
    		click_handler_2,
    		favouritecoinaddermenucontainer_coinToAdd_binding,
    		favouritecoinaddermenucontainer_favouriteCoins_binding,
    		coinNotAdded_handler,
    		AddingCoin_handler,
    		div4_binding,
    		div7_binding,
    		click_handler_3
    	];
    }

    class Favourite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Favourite",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src\components\addpage.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1 } = globals;
    const file$1 = "src\\components\\addpage.svelte";

    // (137:0) {#if $addDataOption.show && $addDataOption.page != "none"}
    function create_if_block$1(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isOnline*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-112bink");
    			add_location(main, file$1, 137, 4, 4967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(137:0) {#if $addDataOption.show && $addDataOption.page != \\\"none\\\"}",
    		ctx
    	});

    	return block;
    }

    // (213:8) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "No connection";
    			if (!src_url_equal(img.src, img_src_value = "./img/globe.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "no connection");
    			attr_dev(img, "class", "svelte-112bink");
    			add_location(img, file$1, 214, 16, 9630);
    			attr_dev(span, "class", "svelte-112bink");
    			add_location(span, file$1, 215, 16, 9695);
    			attr_dev(div, "class", "no-connection svelte-112bink");
    			add_location(div, file$1, 213, 12, 9585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(213:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (139:8) {#if isOnline}
    function create_if_block_1$1(ctx) {
    	let div2;
    	let header;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let span;

    	let t1_value = (/*$addDataOption*/ ctx[12].page == "ad" && !/*isPosting*/ ctx[10]
    	? "Create new AD"
    	: /*isPosting*/ ctx[10] && !/*uploadingError*/ ctx[7]
    		? `Uploading ${/*$addDataOption*/ ctx[12].page == "ad"
			? "AD"
			: "message"}`
    		: /*isPosting*/ ctx[10] && /*uploadingError*/ ctx[7]
    			? ""
    			: "Create new message") + "";

    	let t1;
    	let t2;
    	let button0;
    	let t3;
    	let t4;
    	let footer0;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let p;
    	let t7;
    	let button1;
    	let t9;
    	let footer1;
    	let circle;
    	let t10;
    	let footer2;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t11;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let div1;
    	let input0;
    	let input0_placeholder_value;
    	let t13;
    	let textarea;
    	let div2_intro;
    	let t14;
    	let input1;
    	let current;
    	let mounted;
    	let dispose;

    	circle = new Circle({
    			props: { color: "#303030", size: 115, unit: "px" },
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block_2$1, create_if_block_3$1, create_if_block_4$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (!/*isLoading*/ ctx[6] && !/*showUplaodedImage*/ ctx[0] && /*uploadedUrl*/ ctx[1] == null && !/*hasError*/ ctx[2]) return 0;
    		if (!/*isLoading*/ ctx[6] && !/*showUplaodedImage*/ ctx[0] && /*uploadedUrl*/ ctx[1] == null && /*hasError*/ ctx[2]) return 1;
    		if (/*isLoading*/ ctx[6]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			header = element("header");
    			img0 = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			button0 = element("button");
    			t3 = text("Post");
    			t4 = space();
    			footer0 = element("footer");
    			img1 = element("img");
    			t5 = space();
    			p = element("p");
    			p.textContent = "Upload error occur";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Refresh";
    			t9 = space();
    			footer1 = element("footer");
    			create_component(circle.$$.fragment);
    			t10 = space();
    			footer2 = element("footer");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t11 = space();
    			img2 = element("img");
    			t12 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t13 = space();
    			textarea = element("textarea");
    			t14 = space();
    			input1 = element("input");
    			set_style(img0, "opacity", !/*isPosting*/ ctx[10] ? "1" : "0");
    			if (!src_url_equal(img0.src, img0_src_value = "./img/x.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-112bink");
    			add_location(img0, file$1, 141, 20, 5121);
    			attr_dev(span, "class", "svelte-112bink");
    			add_location(span, file$1, 162, 20, 6070);

    			set_style(button0, "opacity", /*shouldPost*/ ctx[11] && !/*isPosting*/ ctx[10]
    			? "1"
    			: "0");

    			attr_dev(button0, "class", "svelte-112bink");
    			add_location(button0, file$1, 165, 20, 6376);
    			attr_dev(header, "class", "svelte-112bink");
    			add_location(header, file$1, 140, 16, 5091);
    			attr_dev(img1, "id", "upload-image-fill");
    			if (!src_url_equal(img1.src, img1_src_value = "./img/error-mark.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-112bink");
    			add_location(img1, file$1, 170, 20, 6688);
    			attr_dev(p, "class", "svelte-112bink");
    			set_style(p, "color", `#b71c1c`, false);
    			add_location(p, file$1, 171, 20, 6772);
    			attr_dev(button1, "id", "refresh-btn");
    			attr_dev(button1, "class", "svelte-112bink");
    			add_location(button1, file$1, 172, 20, 6841);
    			attr_dev(footer0, "class", "uploading-error svelte-112bink");

    			set_style(
    				footer0,
    				"display",
    				!/*isPosting*/ ctx[10] && /*uploadingError*/ ctx[7]
    				? "flex"
    				: "none",
    				false
    			);

    			add_location(footer0, file$1, 169, 16, 6569);
    			attr_dev(footer1, "class", "loading-screen svelte-112bink");

    			set_style(
    				footer1,
    				"display",
    				/*isPosting*/ ctx[10] && !/*uploadingError*/ ctx[7]
    				? "flex"
    				: "none",
    				false
    			);

    			add_location(footer1, file$1, 176, 16, 7018);
    			attr_dev(img2, "id", "full-image");

    			if (!src_url_equal(img2.src, img2_src_value = !/*isLoading*/ ctx[6] && /*showUplaodedImage*/ ctx[0] && /*uploadedUrl*/ ctx[1] != null && !/*hasError*/ ctx[2]
    			? /*uploadedUrl*/ ctx[1]
    			: "")) attr_dev(img2, "src", img2_src_value);

    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-112bink");

    			set_style(
    				img2,
    				"display",
    				!/*isLoading*/ ctx[6] && /*showUplaodedImage*/ ctx[0] && /*uploadedUrl*/ ctx[1] != null && !/*hasError*/ ctx[2]
    				? "block"
    				: "none",
    				false
    			);

    			add_location(img2, file$1, 203, 24, 8804);
    			attr_dev(div0, "id", "upload-image");
    			attr_dev(div0, "class", "svelte-112bink");
    			add_location(div0, file$1, 180, 20, 7338);
    			attr_dev(input0, "type", "text");

    			attr_dev(input0, "placeholder", input0_placeholder_value = /*$addDataOption*/ ctx[12].page == "ad"
    			? "Type link"
    			: "Type link");

    			attr_dev(input0, "class", "svelte-112bink");
    			add_location(input0, file$1, 206, 24, 9152);
    			attr_dev(textarea, "placeholder", "Type message");
    			attr_dev(textarea, "class", "svelte-112bink");
    			add_location(textarea, file$1, 207, 24, 9292);
    			attr_dev(div1, "id", "upload-text");
    			attr_dev(div1, "class", "svelte-112bink");
    			add_location(div1, file$1, 205, 20, 9104);
    			attr_dev(footer2, "class", "body svelte-112bink");

    			set_style(
    				footer2,
    				"display",
    				!/*isPosting*/ ctx[10] && !/*uploadingError*/ ctx[7]
    				? "flex"
    				: "none",
    				false
    			);

    			add_location(footer2, file$1, 179, 16, 7229);
    			attr_dev(div2, "class", "container svelte-112bink");
    			add_location(div2, file$1, 139, 12, 5011);
    			attr_dev(input1, "accept", "image/*");
    			attr_dev(input1, "type", "file");
    			set_style(input1, "display", `none`, false);
    			add_location(input1, file$1, 211, 12, 9451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, header);
    			append_dev(header, img0);
    			append_dev(header, t0);
    			append_dev(header, span);
    			append_dev(span, t1);
    			append_dev(header, t2);
    			append_dev(header, button0);
    			append_dev(button0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, footer0);
    			append_dev(footer0, img1);
    			append_dev(footer0, t5);
    			append_dev(footer0, p);
    			append_dev(footer0, t7);
    			append_dev(footer0, button1);
    			append_dev(div2, t9);
    			append_dev(div2, footer1);
    			mount_component(circle, footer1, null);
    			append_dev(div2, t10);
    			append_dev(div2, footer2);
    			append_dev(footer2, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			append_dev(div0, t11);
    			append_dev(div0, img2);
    			/*img2_binding*/ ctx[19](img2);
    			append_dev(footer2, t12);
    			append_dev(footer2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*titleORLink*/ ctx[4]);
    			append_dev(div1, t13);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*message*/ ctx[3]);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, input1, anchor);
    			/*input1_binding*/ ctx[22](input1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(button0, "click", /*postData*/ ctx[14], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[20]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[21]),
    					listen_dev(input1, "change", /*loadImage*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*isPosting*/ 1024) {
    				set_style(img0, "opacity", !/*isPosting*/ ctx[10] ? "1" : "0");
    			}

    			if ((!current || dirty & /*$addDataOption, isPosting, uploadingError*/ 5248) && t1_value !== (t1_value = (/*$addDataOption*/ ctx[12].page == "ad" && !/*isPosting*/ ctx[10]
    			? "Create new AD"
    			: /*isPosting*/ ctx[10] && !/*uploadingError*/ ctx[7]
    				? `Uploading ${/*$addDataOption*/ ctx[12].page == "ad"
					? "AD"
					: "message"}`
    				: /*isPosting*/ ctx[10] && /*uploadingError*/ ctx[7]
    					? ""
    					: "Create new message") + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*shouldPost, isPosting*/ 3072) {
    				set_style(button0, "opacity", /*shouldPost*/ ctx[11] && !/*isPosting*/ ctx[10]
    				? "1"
    				: "0");
    			}

    			if (dirty & /*isPosting, uploadingError*/ 1152) {
    				set_style(
    					footer0,
    					"display",
    					!/*isPosting*/ ctx[10] && /*uploadingError*/ ctx[7]
    					? "flex"
    					: "none",
    					false
    				);
    			}

    			if (dirty & /*isPosting, uploadingError*/ 1152) {
    				set_style(
    					footer1,
    					"display",
    					/*isPosting*/ ctx[10] && !/*uploadingError*/ ctx[7]
    					? "flex"
    					: "none",
    					false
    				);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div0, t11);
    				} else {
    					if_block = null;
    				}
    			}

    			if (!current || dirty & /*isLoading, showUplaodedImage, uploadedUrl, hasError*/ 71 && !src_url_equal(img2.src, img2_src_value = !/*isLoading*/ ctx[6] && /*showUplaodedImage*/ ctx[0] && /*uploadedUrl*/ ctx[1] != null && !/*hasError*/ ctx[2]
    			? /*uploadedUrl*/ ctx[1]
    			: "")) {
    				attr_dev(img2, "src", img2_src_value);
    			}

    			if (dirty & /*isLoading, showUplaodedImage, uploadedUrl, hasError*/ 71) {
    				set_style(
    					img2,
    					"display",
    					!/*isLoading*/ ctx[6] && /*showUplaodedImage*/ ctx[0] && /*uploadedUrl*/ ctx[1] != null && !/*hasError*/ ctx[2]
    					? "block"
    					: "none",
    					false
    				);
    			}

    			if (!current || dirty & /*$addDataOption*/ 4096 && input0_placeholder_value !== (input0_placeholder_value = /*$addDataOption*/ ctx[12].page == "ad"
    			? "Type link"
    			: "Type link")) {
    				attr_dev(input0, "placeholder", input0_placeholder_value);
    			}

    			if (dirty & /*titleORLink*/ 16 && input0.value !== /*titleORLink*/ ctx[4]) {
    				set_input_value(input0, /*titleORLink*/ ctx[4]);
    			}

    			if (dirty & /*message*/ 8) {
    				set_input_value(textarea, /*message*/ ctx[3]);
    			}

    			if (dirty & /*isPosting, uploadingError*/ 1152) {
    				set_style(
    					footer2,
    					"display",
    					!/*isPosting*/ ctx[10] && !/*uploadingError*/ ctx[7]
    					? "flex"
    					: "none",
    					false
    				);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			transition_in(if_block);

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, scale, { duration: 230, opacity: 0 });
    					div2_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(circle);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*img2_binding*/ ctx[19](null);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(input1);
    			/*input1_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(139:8) {#if isOnline}",
    		ctx
    	});

    	return block;
    }

    // (201:44) 
    function create_if_block_4$1(ctx) {
    	let circle;
    	let current;

    	circle = new Circle({
    			props: { color: "#303030", size: 65, unit: "px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(circle.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(circle, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(circle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(circle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(circle, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(201:44) ",
    		ctx
    	});

    	return block;
    }

    // (191:102) 
    function create_if_block_3$1(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Image upload error occur";
    			t2 = space();
    			button = element("button");
    			button.textContent = "Refresh";
    			attr_dev(img, "id", "upload-image-fill");
    			if (!src_url_equal(img.src, img_src_value = "./img/error-mark.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-112bink");
    			add_location(img, file$1, 191, 28, 8078);
    			attr_dev(p, "class", "svelte-112bink");
    			set_style(p, "color", `#b71c1c`, false);
    			add_location(p, file$1, 192, 28, 8170);
    			attr_dev(button, "id", "refresh-btn");
    			attr_dev(button, "class", "svelte-112bink");
    			add_location(button, file$1, 193, 28, 8253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(191:102) ",
    		ctx
    	});

    	return block;
    }

    // (182:24) {#if !isLoading && !showUplaodedImage && uploadedUrl == null && !hasError}
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Upload image";
    			t2 = space();
    			button = element("button");
    			button.textContent = "Select from computer";
    			attr_dev(img, "id", "upload-image-fill");
    			if (!src_url_equal(img.src, img_src_value = "./img/image-fill.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-112bink");
    			add_location(img, file$1, 182, 28, 7491);
    			attr_dev(p, "class", "svelte-112bink");
    			add_location(p, file$1, 183, 28, 7583);
    			attr_dev(button, "id", "upload");
    			attr_dev(button, "class", "svelte-112bink");
    			add_location(button, file$1, 184, 28, 7632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(182:24) {#if !isLoading && !showUplaodedImage && uploadedUrl == null && !hasError}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$addDataOption*/ ctx[12].show && /*$addDataOption*/ ctx[12].page != "none" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$addDataOption*/ ctx[12].show && /*$addDataOption*/ ctx[12].page != "none") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$addDataOption*/ 4096) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let shouldPost;
    	let $addDataOption;
    	validate_store(addDataOption, 'addDataOption');
    	component_subscribe($$self, addDataOption, $$value => $$invalidate(12, $addDataOption = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Addpage', slots, []);
    	let showUplaodedImage = false;
    	let uploadedUrl = null;
    	let hasError = false;
    	let uploadingError = false;
    	let message = String();
    	let titleORLink = String();
    	let isOnline = window.navigator.onLine;
    	let fileInputer = null;
    	let isLoading = false;
    	let fullImage = null;

    	const loadImage = e => {
    		if (fileInputer != null && isOnline) {
    			let data = new FormData();
    			data.append('file', fileInputer.files[0]);
    			$$invalidate(6, isLoading = true);

    			fetch(
    				`https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/upload/${$addDataOption.page == "message"
				? "message-images"
				: "ads-images"}`,
    				{ method: "POST", body: data }
    			).then(data => {
    				return data.json();
    			}).then(data => {
    				if (data.state == "success") {
    					if (fullImage != null) {
    						$$invalidate(9, fullImage.src = data.data.imageUrl, fullImage);

    						$$invalidate(
    							9,
    							fullImage.onload = () => {
    								$$invalidate(6, isLoading = false);
    								$$invalidate(0, showUplaodedImage = true);
    								$$invalidate(1, uploadedUrl = data.data.imageUrl);
    								$$invalidate(2, hasError = false);
    							},
    							fullImage
    						);

    						$$invalidate(
    							9,
    							fullImage.onerror = () => {
    								$$invalidate(1, uploadedUrl = null);
    								$$invalidate(0, showUplaodedImage = false);
    								$$invalidate(2, hasError = true);
    								$$invalidate(6, isLoading = false);
    							},
    							fullImage
    						);
    					}
    				} else {
    					$$invalidate(2, hasError = true);
    					$$invalidate(6, isLoading = false);
    				}
    			}).catch(_ => {
    				$$invalidate(2, hasError = true);
    				$$invalidate(6, isLoading = false);
    			});
    		}
    	};

    	const checkConnection = () => {
    		$$invalidate(5, isOnline = window.navigator.onLine);
    		requestAnimationFrame(checkConnection);
    	};

    	requestAnimationFrame(checkConnection);
    	let isPosting = false;

    	const postData = () => {
    		if (shouldPost) {
    			$$invalidate(10, isPosting = true);

    			if ($addDataOption.page == "ad") {
    				fetch(`https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/ads/${$addDataOption.input.id}`, {
    					method: "POST",
    					body: JSON.stringify({
    						"link": titleORLink,
    						message,
    						"image": uploadedUrl
    					}),
    					headers: {
    						"Accept": "*/*",
    						"Content-Type": "application/json"
    					}
    				}).then(function (response) {
    					return response.json();
    				}).then(function (data) {
    					$$invalidate(10, isPosting = false);

    					if (data.state == "success") {
    						set_store_value(
    							addDataOption,
    							$addDataOption = {
    								show: false,
    								page: "none",
    								input: null,
    								output: { from: "ad", data: data.data }
    							},
    							$addDataOption
    						);
    					} else {
    						throw new Error();
    					}
    				}).catch(_ => {
    					$$invalidate(7, uploadingError = true);
    				});
    			} else if ($addDataOption.page == "message") {
    				fetch("https://crypto-revolution-masters.herokuapp.com/7sEEgy4Gz1O7yFBXvjd7N0NyIGWIRg8D/admin/message", {
    					method: "POST",
    					body: JSON.stringify({
    						"link": titleORLink,
    						message,
    						"image": uploadedUrl
    					}),
    					headers: {
    						"Accept": "*/*",
    						"Content-Type": "application/json"
    					}
    				}).then(function (response) {
    					return response.json();
    				}).then(function (data) {
    					$$invalidate(10, isPosting = false);

    					if (data.state == "success") {
    						set_store_value(
    							addDataOption,
    							$addDataOption = {
    								show: false,
    								page: "none",
    								input: null,
    								output: { from: "message", data: data.data }
    							},
    							$addDataOption
    						);
    					} else {
    						throw new Error();
    					}
    				}).catch(_ => {
    					$$invalidate(7, uploadingError = true);
    				});
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Addpage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = _ => {
    		if (uploadedUrl != null) {
    			fetch(uploadedUrl, {
    				method: "DELETE",
    				headers: { "Accept": "*/*" }
    			}).then(_ => null).catch(_ => null);
    		}

    		if (fileInputer != null) {
    			$$invalidate(8, fileInputer.value = null, fileInputer);
    		}

    		set_store_value(
    			addDataOption,
    			$addDataOption = {
    				show: false,
    				page: "none",
    				input: null,
    				output: null
    			},
    			$addDataOption
    		);
    	};

    	const click_handler_1 = _ => {
    		$$invalidate(7, uploadingError = false);
    	};

    	const click_handler_2 = _ => {
    		if (fileInputer != null) {
    			$$invalidate(8, fileInputer.value = null, fileInputer);
    			fileInputer.click();
    		}
    	};

    	const click_handler_3 = _ => {
    		$$invalidate(6, isLoading = true);

    		setTimeout(
    			() => {
    				$$invalidate(2, hasError = false);
    				$$invalidate(6, isLoading = false);
    			},
    			200
    		);
    	};

    	function img2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fullImage = $$value;
    			$$invalidate(9, fullImage);
    		});
    	}

    	function input0_input_handler() {
    		titleORLink = this.value;
    		$$invalidate(4, titleORLink);
    	}

    	function textarea_input_handler() {
    		message = this.value;
    		$$invalidate(3, message);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileInputer = $$value;
    			$$invalidate(8, fileInputer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Circle,
    		scale,
    		addDataOption,
    		showUplaodedImage,
    		uploadedUrl,
    		hasError,
    		uploadingError,
    		message,
    		titleORLink,
    		isOnline,
    		fileInputer,
    		isLoading,
    		fullImage,
    		loadImage,
    		checkConnection,
    		isPosting,
    		postData,
    		shouldPost,
    		$addDataOption
    	});

    	$$self.$inject_state = $$props => {
    		if ('showUplaodedImage' in $$props) $$invalidate(0, showUplaodedImage = $$props.showUplaodedImage);
    		if ('uploadedUrl' in $$props) $$invalidate(1, uploadedUrl = $$props.uploadedUrl);
    		if ('hasError' in $$props) $$invalidate(2, hasError = $$props.hasError);
    		if ('uploadingError' in $$props) $$invalidate(7, uploadingError = $$props.uploadingError);
    		if ('message' in $$props) $$invalidate(3, message = $$props.message);
    		if ('titleORLink' in $$props) $$invalidate(4, titleORLink = $$props.titleORLink);
    		if ('isOnline' in $$props) $$invalidate(5, isOnline = $$props.isOnline);
    		if ('fileInputer' in $$props) $$invalidate(8, fileInputer = $$props.fileInputer);
    		if ('isLoading' in $$props) $$invalidate(6, isLoading = $$props.isLoading);
    		if ('fullImage' in $$props) $$invalidate(9, fullImage = $$props.fullImage);
    		if ('isPosting' in $$props) $$invalidate(10, isPosting = $$props.isPosting);
    		if ('shouldPost' in $$props) $$invalidate(11, shouldPost = $$props.shouldPost);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isOnline, isLoading, showUplaodedImage, hasError, uploadedUrl, message, titleORLink*/ 127) {
    			$$invalidate(11, shouldPost = isOnline && !isLoading && showUplaodedImage && !hasError && uploadedUrl != null && message != String() && titleORLink != String());
    		}
    	};

    	return [
    		showUplaodedImage,
    		uploadedUrl,
    		hasError,
    		message,
    		titleORLink,
    		isOnline,
    		isLoading,
    		uploadingError,
    		fileInputer,
    		fullImage,
    		isPosting,
    		shouldPost,
    		$addDataOption,
    		loadImage,
    		postData,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		img2_binding,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_binding
    	];
    }

    class Addpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Addpage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    // (22:1) {:else}
    function create_else_block(ctx) {
    	let loginpage;
    	let current;
    	loginpage = new Loginpage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loginpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loginpage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loginpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loginpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loginpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(22:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:1) {#if $isLogin}
    function create_if_block_1(ctx) {
    	let navbar;
    	let t0;
    	let ads;
    	let t1;
    	let message;
    	let t2;
    	let favourite;
    	let t3;
    	let t4;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;
    	navbar = new Navbar_1({ $$inline: true });
    	ads = new Ads({ $$inline: true });
    	message = new Message({ $$inline: true });
    	favourite = new Favourite({ $$inline: true });
    	let if_block0 = /*$addDataOption*/ ctx[1].show && /*$addDataOption*/ ctx[1].page != "none" && create_if_block_4(ctx);
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$currentTab*/ ctx[2] == "settings") return 0;
    		if (/*$currentTab*/ ctx[2] == "users") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(ads.$$.fragment);
    			t1 = space();
    			create_component(message.$$.fragment);
    			t2 = space();
    			create_component(favourite.$$.fragment);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(ads, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(message, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(favourite, target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$addDataOption*/ ctx[1].show && /*$addDataOption*/ ctx[1].page != "none") {
    				if (if_block0) {
    					if (dirty & /*$addDataOption*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(ads.$$.fragment, local);
    			transition_in(message.$$.fragment, local);
    			transition_in(favourite.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(ads.$$.fragment, local);
    			transition_out(message.$$.fragment, local);
    			transition_out(favourite.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(ads, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(message, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(favourite, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(9:1) {#if $isLogin}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#if $addDataOption.show && $addDataOption.page != "none"}
    function create_if_block_4(ctx) {
    	let addpage;
    	let current;
    	addpage = new Addpage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(14:2) {#if $addDataOption.show && $addDataOption.page != \\\"none\\\"}",
    		ctx
    	});

    	return block;
    }

    // (19:35) 
    function create_if_block_3(ctx) {
    	let users;
    	let current;
    	users = new Users({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(users.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(users, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(users.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(users.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(users, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(19:35) ",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if $currentTab == "settings"}
    function create_if_block_2(ctx) {
    	let settings;
    	let current;
    	settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(settings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:2) {#if $currentTab == \\\"settings\\\"}",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#if $isLogin}
    function create_if_block(ctx) {
    	const block = {
    		c: function create() {
    			document.title = "Dashboard";
    		},
    		m: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:1) {#if $isLogin}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$isLogin*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*$isLogin*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(main, "class", "svelte-1uctt3p");
    			add_location(main, file, 7, 0, 331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(document.head, null);
    			append_dev(document.head, if_block1_anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(main, null);
    			}

    			if (/*$isLogin*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isLogin;
    	let $addDataOption;
    	let $currentTab;
    	validate_store(isLogin, 'isLogin');
    	component_subscribe($$self, isLogin, $$value => $$invalidate(0, $isLogin = $$value));
    	validate_store(addDataOption, 'addDataOption');
    	component_subscribe($$self, addDataOption, $$value => $$invalidate(1, $addDataOption = $$value));
    	validate_store(currentTab, 'currentTab');
    	component_subscribe($$self, currentTab, $$value => $$invalidate(2, $currentTab = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar: Navbar_1,
    		Loginpage,
    		Settings,
    		Users,
    		Ads,
    		Message,
    		Favourite,
    		addDataOption,
    		currentTab,
    		isLogin,
    		Addpage,
    		$isLogin,
    		$addDataOption,
    		$currentTab
    	});

    	return [$isLogin, $addDataOption, $currentTab];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({ target: document.body });

    return app;

})();
//# sourceMappingURL=bundle.js.map
