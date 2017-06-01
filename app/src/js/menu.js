/* eslint-env browser  */

var Index = Index || {};
Index.menu = function (callback) {
    "use strict";

    var that = {};

    function init() {
        console.log("init menu");

        $('input').iCheck({
            checkboxClass: 'icheckbox_square-red',
            radioClass: 'iradio_square-red',
        });


        //Menü der Oberkategorien
        //angepasst von https://www.kirupa.com/html5/creating_a_sweet_content_slider.htm
        var links = document.querySelectorAll(".master_label");
        var wrapper = document.querySelector("#checkboxes");
        var activeLink = 0;


        for (var i = 0; i < links.length; i++) {
            var link = links[i];

            link.addEventListener('mouseover', setHoveredItem, false);

            link.itemID = i;
        }

        links[activeLink].classList.add("active");

        function setHoveredItem(e) {
            removeActiveLinks();

            var clickedLink = e.target;
            activeLink = clickedLink.itemID;

            changePosition(clickedLink);
        }

        function removeActiveLinks() {
            for (var i = 0; i < links.length; i++) {
                links[i].classList.remove("active");
            }
        }

        // Handle changing the slider position as well as ensure
        // the correct link is highlighted as being active
        function changePosition(link) {
            var position = link.getAttribute("data-pos");

            var translateValue = "translate3d(" + position + ", 0px, 0)";
            wrapper.style.transform = translateValue;

            link.classList.add("active");
        }

        //



        var $subiCheck = $("#checkboxes .icheckbox");

        $(document).on("click", "#checkboxes .icheckbox", function () {
            $(this).iCheck("toggle");
        });

        $(document).on("click", "#master_cats_menu .icheckbox", function () {
            $(this).iCheck("toggle");
        });


        //Angepasst von https://stackoverflow.com/questions/17820080/function-select-all-and-icheck
        var checkAll = $('.master_input');
        var checkboxes = $('input').not(".master_input");


        checkAll.on('ifChecked ifUnchecked', function (event) {
            if (event.type == 'ifChecked') {
                $("div[data-cat=" + $(this).attr('id') + "]").iCheck("check");
            } else {
                $("div[data-cat=" + $(this).attr('id') + "]").iCheck('uncheck');
            }
        });
        

        $("#checkboxes .icheckbox").on('ifChanged', function (event) {
           // console.log($(this).parent().siblings().find("input").filter(':checked').length)
           // console.log($(this).parent().siblings().find("input").length)
            
            if ($(this).parent().siblings().addBack().find("input").filter(':checked').length == $(this).parent().siblings().addBack().find("input").length) {
                console.log("alle markiert")
                $("#" + $(this).data("cat")).iCheck("check");

            } else {
                if ($(this).parent().siblings().addBack().find("input").filter(':checked').length == 0) {
                    console.log($(this).parent().siblings().addBack().find("input").filter(':checked').length)
                    $("#" + $(this).data("cat")).iCheck("uncheck");
                    console.log("keine markiert")
                } else {
                    console.log($(this).parent().siblings().addBack().find("input").filter(':checked').length)
                    $("#" + $(this).data("cat")).iCheck('indeterminate');
                    console.log("einige markiert")

                }
            }
            //checkAll.iCheck('update');
            //callback für main
            callback(getCheckedCats());
        });

    };


    //Angepasst von https://stackoverflow.com/questions/17820080/function-select-all-and-icheck


    function getCheckedCats() {
        var dic = $("input[type=checkbox]:checked").map(function () {
            return $(this).parent().parent().attr("id");
        }).toArray();
        return dic;
    }

    //that.getCheckedCats = getCheckedCats;
    that.init = init;
    return that;

};