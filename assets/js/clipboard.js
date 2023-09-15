/* https://gist.github.com/crykn/561307b8d70ce104eba0a57f29785e3f */
function sleep(t) {
    return new Promise(e => setTimeout(e, t))
}

async function onClickEffect(t, e) {
    t.removeClass("btn-light"), t.addClass(e), await sleep(250), t.removeClass(e), t.addClass("btn-light")
}

$(document).ready(function () {
    $(".page__content pre > code").each(function () {
        $(this).parent().prepend($(document.createElement("button")).prop({
            type: "button",
            innerHTML: '<i class="far fa-copy"></i>'
        }).attr("title", "Copy to clipboard").addClass("btn").addClass("btn--primary").css("position", "absolute").css("right", "1em").on("click", function () {
            let t = $(this).parent().children("code").first();
            if (!t) throw new Error("Unexpected error! No corresponding code block was found for this button.");
            return onClickEffect($(this), "btn--success"), navigator.clipboard.writeText($(t).text()).then(() => !0, () => !0), !0
        }))
    })
});
