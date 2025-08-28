 (function () {
   // Idempotent
   if (window.__NOIBU_RRWEB_ACTIVE__) return;
   window.__NOIBU_RRWEB_ACTIVE__ = true;

   // Errors → console only (no extra native messages)
   function err(msg, e) {
     try { console.error("[Noibu][rrweb] " + msg, e || ""); } catch (_) {}
   }

   // Post only expected types
   function post(type, payload) {
     try {
       window.webkit.messageHandlers.rrwebHandler.postMessage({ type, ...(payload || {}) });
     } catch (e) {
       err("postMessage failed (" + type + ")", e);
     }
   }

   try {
     // CommonJS shim for record.umd.min.cjs
     var module = { exports: {} };
     var exports = module.exports;

     // rrweb bundle injected by Swift
     {{RRWEB_SCRIPT_CONTENT}}

     var RR =
       module && module.exports && module.exports.record
         ? module.exports
         : (typeof rrweb !== "undefined" ? rrweb : null);

     var ok = !!(RR && RR.record);
     post("rrweb-script-loaded", { success: ok });
     if (!ok) {
       err("rrweb.record not available after injection");
       post("rrweb-initialized", { success: false });
       return;
     }

     // Delay rrweb start until DOMContentLoaded (or start immediately if DOM is already ready)
     function startRecording() {
       if (window.__rrweb_recording__) return;
       try {
         window.__rrweb_stopFn__ = RR.record({
           emit: function (event) {
             try { post("rrweb-event", { event }); }
             catch (e) { err("emit -> post(rrweb-event) failed", e); }
           },
           recordCrossOriginIframes: true,
           collectFonts: true,
         });
         window.__rrweb_recording__ = true;
         post("rrweb-initialized", { success: true });
         post("rrweb-verification", {
           recording: true,
           hasStopFunction: typeof window.__rrweb_stopFn__ === "function",
         });
       } catch (e) {
         err("RR.record() threw", e);
         post("rrweb-initialized", { success: false });
       }
     }

     try {
       if (document.readyState === "loading") {
         var onReady = function () {
           try { startRecording(); } finally {
             try { document.removeEventListener("DOMContentLoaded", onReady); } catch (_) {}
           }
         };
         document.addEventListener("DOMContentLoaded", onReady, { once: true });
       } else {
         // DOM is interactive or complete; start now
         startRecording();
       }
     } catch (e) {
       // Fallback if readiness check fails
       err("DOMContentLoaded gating failed; starting immediately", e);
       startRecording();
     }
   } catch (e) {
     err("top-level injection failed", e);
   }

   // Surface uncaught errors in console
   window.addEventListener("error", function (e) {
     err("uncaught error", e.error || e.message || e);
   });
   window.addEventListener("unhandledrejection", function (e) {
     err("unhandled promise rejection", e.reason || e);
   });
 })();
