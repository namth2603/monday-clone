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

    function isPlaceholderVisible(input) {
        return $(input).val() === ""
    }

    $('.search-wrapper input').on("focus blur input", function() {
        if (isPlaceholderVisible(this)) {
            $(this).parent().removeClass('has-text')
        } else {
            $(this).parent().addClass('has-text')
        }
    });

    $('#leftPanelSwitcher').on('click',function () {
        $('#leftPanel').toggleClass('active')
    })

    document.addEventListener('click', function() {
        if (!event.target.closest('.time-tracking-log-item')
            && !event.target.closest('.time-log-icon-delete svg')
            && !event.target.closest('.time-log-icon-delete svg path')
        ) {
            $('.row-item.target').removeClass('target')
        }

        if(!event.target.closest('#leftPanel')
            && !event.target.closest('#leftPanelSwitcher')
        ){
            $('#leftPanel').removeClass('active')
        }
    });
});

