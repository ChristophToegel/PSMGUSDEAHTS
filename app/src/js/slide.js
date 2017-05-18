$(document).ready(function () {
    $(".pull").click(function () {
        $(".menu").slideToggle("fast");
    });


    $(document).on("click", ".icheckbox", function () {
        $(this).iCheck("toggle");
    });


    $(".icheckbox.master").on("ifUnchecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("uncheck");
    });

    $(".icheckbox.master").on("ifChecked", function (event) {
        $(this).parent().parent().find(".icheckbox").iCheck("check");
    });

    $(document).on("click", ".icheckbox", function () {
        console.log($("div").not(".master").not(".master_cat"));
        getCheckedCats();
    });
    
    function getCheckedCats() {
        var dic = $("input[type=checkbox]:checked").map(function () {
            return $(this).parent().parent().attr("id");
        }).toArray();

        console.log(dic);
    }

});