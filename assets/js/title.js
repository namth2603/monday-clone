$(window).on('load', function() {
    $('body').append('<div id="message"><div class="message-wrapper"><span id="messageTx"></span></div></div>');
    $('[data-title]').hover(
        function () {
            var position = $(this).offset();
            $("#message").css({top: $(this).outerHeight() + 10 + position.top, left: $(this).outerWidth()*0.5 + position.left});
            $("#messageTx").text($(this).attr("data-title"))
            $("#message").addClass("active")
        },function () {
            $("#message").removeClass("active")
        }
    )
});