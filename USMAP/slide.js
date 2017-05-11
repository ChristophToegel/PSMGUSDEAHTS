$(document).ready(function () {
    $(".pull").click(function () {
        $(".menu").slideToggle("fast");

    });
    $(document).on("click", ".icheckbox", function () {
        $(this).iCheck("toggle")
    });
    
    $(".icheckbox.master").on("ifUnchecked", function (event) {
        $(".icheckbox").iCheck("uncheck");
    });

    $(".icheckbox.master").on("ifChecked", function (event) {
        $(".icheckbox").iCheck("check");
    });

  
});