// /// <reference path="vendor/jquery.min.js" />

 //$(function () {
   
$(window).load(function () {
    $('#table-vertical-scroll').height(($('.main.inner').height() - ($('.panel').height() + 100))+'px')

    //$('body').prepend('<div class="v-guide.line"></div>');
    //$('body').prepend('<div class="h-guide.line"></div>');
    $(".serviceBlockBody").each(function (i) {
        var arrElements = this.getElementsByClassName("stats-number");
        var maxValue = $(this).attr('data-max') || 100; //parseInt(arrElements[0].getAttribute("data-to"));
        for (var i = 1; i < arrElements.length; i++) {
            if (parseInt(arrElements[i].getAttribute("data-to")) > maxValue) {
                maxValue = parseInt(arrElements[i].getAttribute("data-to"));
            }
        }
        $(this).find('.stats-number:not(.expanded)').each(function () {
            var mWidth = parseInt(($(this).data("to") * 100) / maxValue);
            //console.log(mWidth);
            $(this).parents(".oneProgress").find('.progress-bar').attr("aria-valuenow", mWidth).css("max-width", mWidth + "%");
            $(this).addClass('expanded');
        });
    });
    //$('.stats-number').countTo({
    //    speed: 2000,
    //    refreshInterval: 50
    //});


    if (localStorage.getItem("theme") == 'dark-theme') {
        $('input#cb4').prop('checked', 'checked');
        $('html').addClass('dark-theme');
    }
    $('input#cb4').change(function () {

        if ($(this).is(':checked')) {
            $('html').addClass('dark-theme');
            localStorage.setItem("theme", 'dark-theme');
        }
        else {
            $('html').removeClass('dark-theme');
            localStorage.setItem("theme", "");
            $('body').removeClass('blind-body');
        }
    });

    //$(document).on('change', "input:checkbox", function () {
    //    // in the handler, 'this' refers to the box clicked on
    //    var $box = $(this);
    //    if ($box.is(":checked")) {
    //        // the name of the box is retrieved using the .attr() method
    //        // as it is assumed and expected to be immutable
    //        var group = "input:checkbox[name='" + $box.attr("name") + "']";
    //        // the checked state of the group/box on the other hand will change
    //        // and the current value is retrieved using .prop() method
    //        $(group).prop("checked", false);
    //        $box.prop("checked", true);
    //    } else {
    //        $box.prop("checked", false);
    //    }
    //});
    $('.print').on('click', function () {
        $('.section-container > .pillar, .popup-pillar').addClass('no-print');
        $(this).parents('.popup-pillar').removeClass('no-print').addClass('printed');
        // $(this).parent().hide();
        // $(this).parent().siblings().hide();
        $('.footer-container').hide();
        window.print();
        $('.section-container > .pillar, .popup-pillar').removeClass('no-print');
        $(this).parents('.popup-pillar').removeClass('printed');
        $(this).parent().show();
        $(this).parent().siblings().show();
        $('.footer-container').show();
    });

    // $('.printAllDashboard').on('click', function () {
    //     $('.footer-container').hide();
    //     $('.pile-popup').hide();
    //     $('.section-container .pillar .pile[data-popup="served-hour"]').addClass('pileHeight');
    //     window.print();
    //     $('.footer-container').show();
    //     $('.pile-popup').show();
    //     $('.section-container .pillar .pile[data-popup="served-hour"]').removeClass('pileHeight');
    // });



    // //progress bar
    // $('.barra-nivel').each(function () {
    //     var valorLargura = $(this).data('nivel');
    //     var valorNivel = $(this).parent().parent().prepend("<span class='valor-nivel'>" + valorLargura + "</span>");
    //     $(this).animate({
    //         width: valorLargura
    //     });
    // });


    


    //toggle slide
    $(document).on('click', '.panel-heading', function () {
        $('.panel-collapse').slideToggle();
        $(this).find('.fa-caret-up').toggleClass('active');
    })

// //colapse table
//     $(document).on('click', 'tr.parent .fa-chevron-down', function(){
//         $(this).closest('tbody').toggleClass('open');
//       });




$('.input-group.date').datepicker({
    format: "dd/mm/yyyy",
    autoclose: true,
    showButtonPanel: true,
});

});

$(document).ready(function(){

//print section in header

  //  var d = new Date();
    //var currentYear = d.getFullYear();  //2018
    //var currentMonth = d.getMonth() + 1;
 
  
    // $('.input-group.date.print-from').datepicker('setDate', new Date(currentYear, currentMonth - 1, 1));
    // $('.input-group.date.print-to').datepicker('setDate', new Date(currentYear, currentMonth, 0));
    $(document).on('click', '.printDropDown .printAllDashboard', function () {
        $(this).parents('.printDropDown').toggleClass('active')
        $(this).siblings('div').slideToggle();

        //close filter menu
        $('.control-panel-item.filter.toggle-open[data-open="filter-panel-container"], .filter-panel-container').removeClass('open');
    })



})


var checkDepartments = function (e) {
    var elem;
    if (e) {
        elem = $(e.target);
        console.log(elem.attr('data-prefix'))
        if (elem.attr('data-prefix') == 'AllOTHERS') {

            if (elem.prop('checked')) {
                $('[data-model="NONMOHRE"][data-prefix != "AllOTHERS"]:not(:checked)').click();
                $('[data-model="NONMOHRE"][data-prefix != "AllOTHERS"]:not(:checked)').prop('checked', true);
                $('.filter-department-item span[data-prefix!="MOHRE"]').hide();
                $('.filter-department-item').append('<span class="all-filter-dep">All Others</span>')
            }
            else {
                $('[data-model="NONMOHRE"][data-prefix != "AllOTHERS"]:checked').click();
                $('[data-model="NONMOHRE"][data-prefix != "AllOTHERS"]:checked').prop('checked', false);
                $('.all-filter-dep').remove();
                $('.filter-department-item span').show();
            }
        }
        else {
            if (!elem.prop('checked')) {
                $('.all-filter-dep').remove();
                $('.filter-department-item span').show();
                $('[data-model="NONMOHRE"][data-prefix = "AllOTHERS"]:checked').prop('checked', false);

            }
        }
    }
}


