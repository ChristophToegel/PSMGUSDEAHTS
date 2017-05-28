$(document).ready(function () {
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-red',
        radioClass: 'iradio_square-red',
    });

    $(".pull").click(function () {
        $(".menu").slideToggle("fast");
    });

    $(document).on("click", ".icheckbox", function () {
        $(this).iCheck("toggle");
    });


    //Angepasst von https://stackoverflow.com/questions/17820080/function-select-all-and-icheck
    var checkAll = $('.master_input');
    var checkboxes = $('input').not(".master_input");

    console.log($("#Accidents_master_input").parent().parent().parent().siblings());


    checkAll.on('ifChecked ifUnchecked', function (event) {
        if (event.type == 'ifChecked') {
            $(this).parent().parent().parent().siblings().iCheck('check');
        } else {
            $(this).parent().parent().parent().siblings().iCheck('uncheck');
        }
    });

    checkboxes.on('ifChanged', function (event) {
        if ($(this).parent().parent().parent().siblings(".master_label").siblings().find("input").filter(':checked').length == $(this).parent().parent().parent().siblings(".master_label").siblings().find("input").length) {
            $(this).parent().parent().parent().siblings(".master_label").iCheck("check");
        } else {
            $(this).parent().parent().parent().siblings(".master_label").iCheck('uncheck');   
        }
        checkAll.iCheck('update');
    });







    /* Alt, ohne "all Checked"
    $(document).on("click", ".icheckbox", function () {
        $(this).iCheck("toggle");
    });

    
    $(".icheckbox.master").on("ifUnchecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("uncheck");
    });

    $(".icheckbox.master").on("ifChecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("check");
    });
    
    $(".icheckbox").on("ifUnchecked", function (event) {
        console.log($(this).parent().siblings(".master_label").find(".master"));
        $(this).parent().siblings(".master_label").find(".master.icheckbox").iCheck("uncheck");
    });
    

    $(document).on("click", ".icheckbox", function () {
        getCheckedCats();
    });
    */


    function getCheckedCats() {
        var dic = $("input[type=checkbox]:checked").map(function () {
            return $(this).parent().parent().attr("id");
        }).toArray();
        console.log(dic);
    }

});