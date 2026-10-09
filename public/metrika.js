// Yandex.Metrika counter 113575886.
// Вынесен в отдельный файл, а не инлайном в index.html: CSP сайта
// (script-src 'self', см. server/app.mjs и vercel.json) запрещает
// инлайн-скрипты, и ослаблять её ради счётчика не стоит.
(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=113575886', 'ym');

ym(113575886, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
