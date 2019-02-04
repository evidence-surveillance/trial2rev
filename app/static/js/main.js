/**
 * Created by User on 12/05/2017.

 */



$(document).ready(function () {

        var socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port);

        function setPubDate() {
            var pub_year = ($("#pub_date").html());
            pub_date = new Date(pub_year, 1, 1);
            var days = (Math.round((new Date() - pub_date) / (1000 * 60 * 60 * 24))).toFixed(0);
            if (days >= 365) {
                var years = (days / 365).toFixed(2);
                $("#time_since_pub").html(years + ' years');

            }
            else {
                $("#time_since_pub").html(days + ' days');
            }

        }


        function refresh_dashboard() {
            var num_i = 0;
            var interval = setInterval(function () {
                var target = $("#incl_trials_container .panel").length;
                $('#num_incl_trials').text(num_i);
                if (num_i >= target) clearInterval(interval);
                num_i++;
            }, 30);
            var incl_part = 0;
            $(".incl-enrol").each(function () {
                if (parseInt($(this).attr('title'))) {
                    incl_part += parseInt($(this).attr('title'));
                }
            });
            var num_p = 0;
            var interval2 = setInterval(function () {
                $('#part_incl_trials').text(num_p);
                if (num_p >= incl_part) {
                    clearInterval(interval2);
                    $('#part_incl_trials').text(incl_part);
                }
                num_p += parseInt((incl_part / 66).toFixed());
            }, 30);

        }


        socket.on('page_content', function (msg) {
            if (msg['section'] === 'review_data') {
                $("#review-data-container").html(msg['data']);
                $("#related-reviews").html(msg['related_reviews']);
                $("#review-data-container").slideDown(1000);
                $("#related-reviews").slideDown(1000);
                setPubDate();

            }
            if (msg['section'] === 'search_results') {
                console.log('recieved results');
                console.log(msg['data']);
                $(".pg_content").attr('style', 'display:none;');
                $(".pg_content").html(msg['data']);
                $(".pg_content").slideDown(1000);
                $(".progress_div").slideUp(1000);
            }

            if (msg['section'] === 'plot') {
                var plot = $("#plot");
                var dash = $("#dash");
                var both = $("#plot, #dash");
                if (msg['page'] === 'reviewdetail') {
                    if (!$.trim(plot.html())) {
                        plot.empty().append(msg['data']);
                        both.delay(1000).slideDown(2000);
                        $(".progress_div").slideUp(1000);
                    } else {
                        console.log('not empty');
                        plot.animate({'opacity': 0.01}, 1000, function () {
                            plot.html(msg['data']);
                            plot.animate({'opacity': 1}, 1000);
                        });

                    }


                } else {
                    var title = msg['title'];
                    var id = msg['review_id'];
                    var title_div = $("#plot_title");
                    if (plot.is(':empty') && title_div.is(':empty')) {
                        plot.append(msg['data']);
                        title_div.html(title);
                        title_div.attr('href', '/search?searchterm=' + id);
                        title_div.fadeIn(2000);
                        both.fadeIn(2000);
                        $("#refresh_plot").fadeIn(2000);
                    } else {
                        title_div.fadeOut(2000, function () {
                            title_div.attr('href', '/search?searchterm=' + id);
                            title_div.empty().html(title);
                        });
                        both.fadeOut(2000, function () {
                            plot.empty().append(msg['data']);
                        });
                        $("#refresh_plot").fadeOut(2000);
                    }

                    title_div.fadeIn(2000);
                    both.fadeIn(2000);
                    $("#refresh_plot").fadeIn(2000);

                }

            }


            }
            if (msg['section'] === 'rel_trials') {
                var rel_container = $("#rel_trials_container");
                if (rel_container.is(':empty')) {
                    rel_container.html(msg['data']);
                    rel_container.slideDown(2000);
                } else {
                    var node = $.parseHTML(msg['data']);
                    var replacement = $(node).filter('#accordion-rel');
                    $("#accordion-rel").html(replacement.html());
                    calc_completeness();
                }
                var size_li = $("#accordion-rel").children("div.panel-default").length;
                var x = 20;
                $('#accordion-rel div.panel-default').hide();
                $('#accordion-rel div.panel-default:lt(' + x + ')').show();
                $('#load_more_rel').click(function () {
                    x = (x + 5 <= size_li) ? x + 5 : size_li;
                    $('#accordion-rel div.panel-default:lt(' + x + ')').show();
                    if (x === size_li) {$('#load_more_rel').hide();}
                });
                // $('#showLess').click(function () {
                //     x=(x-5<0) ? 3 : x-5;
                //     $('#myList li').not(':lt('+x+')').hide();
                // });

                $(".upvote").each(function () {
                    $(this).upvote({
                        callback: upvote_callback
                    });
                });
                console.log(msg['sort']);
                $('.rel').removeClass('active');
                $("#" + msg['sort'] + '.rel').addClass('active');

            }

            if (msg['section'] === 'incl_trials') {

                var node = $.parseHTML(msg['data']);
                var replacement = $(node).filter('#accordion-incl');
                console.log(replacement);

                var incl_container = $("#incl_trials_container");
                if (incl_container.is(':empty') || $("#accordion-incl").length === 0 || replacement.length === 0) {
                    incl_container.html(msg['data']);
                    incl_container.slideDown(3000, function () {
                        refresh_dashboard();
                    });
                } else {
                    var node = $.parseHTML(msg['data']);
                    $("#accordion-incl").replaceWith(replacement);
                }
                var size_li = $("#accordion-incl").children("div.panel-default").length;
                var x = 20;
                if (size_li <= x) {$('#load_more_incl').hide();}
                $('#accordion-incl div.panel-default').hide();
                $('#accordion-incl div.panel-default:lt(' + x + ')').show();
                $('#load_more_incl').click(function () {
                    x = (x + 5 <= size_li) ? x + 5 : size_li;
                    $('#accordion-incl div.panel-default:lt(' + x + ')').show();
                     if (x === size_li) {$('#load_more_incl').hide();}
                });
                $('.incl').removeClass('active');

                $("#" + msg['sort'] + '.incl').addClass('active');


            }

            if (msg['section'] === 'no_results') {
                $("#review-data-container").html(msg['data']);
                $("#review-data-container").slideDown(1000);
                $("#review-trials-container").empty();
                $(".progress_div").slideUp(1000);
            }
            console.log(msg);

        });

        if (document.URL.indexOf("browse") > -1) {
            $.ajax({
                url: '/category_counts',
                type: 'get',
                contentType: 'application/json;charset=UTF-8',
                error: function (data2) {
                },
                success: function (data) {
                    data = JSON.parse(data)['data'];
                    console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        $("#" + data[i]['code']).html(data[i]['count'])
                    }
                    $(".list-group-item").each(function () {
                        if ($(this).text() === '...') {
                            $(this).remove();
                        }
                    })

                }
            });
        }

        if (document.URL.indexOf("category") > -1) {
            var addr = document.URL.split('/');
            $.ajax({
                url: '/condition_counts',
                type: 'POST',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({"category": addr[addr.length - 1]}),
                error: function (data2) {
                },
                success: function (data) {
                    data = JSON.parse(data)['data'];
                    console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        $("#condition_" + data[i]['id']).html(data[i]['count'])
                    }
                    $(".badge").each(function () {
                        if ($(this).text() === '...') {
                            $(this).closest('li').remove();
                        }
                    })
                }
            });
        }


        socket.on('my_response', function (msg) {
            if (document.URL.indexOf("search") >= 0) {
                $(document).ready(function () {
                    console.log('triggering search');
                    socket.emit('search', {'review_id': getUrlParameter('searchterm')});
                    $(".progress_div").slideDown(1000);
                });
            }
            var url = window.location.href;
                if (window.location.pathname === '/') {
                $(document).ready(function () {
                    console.log('triggering new plot');
                    socket.emit('get_plot', {});
                    var plot_interval = window.setInterval(function () {
                        socket.emit('get_plot', {});
                    }, 10000);
                    $(document).on("click", "#refresh_plot", function (e) {
                        window.clearInterval(plot_interval);
                        $("#plot").fadeOut();
                        $("#plot_title").fadeOut();
                        $("#refresh_plot").fadeOut();
                        socket.emit('get_plot', {});
                        plot_interval = window.setInterval(function () {
                            socket.emit('get_plot', {});
                        }, 10000);
                    });
                    $.ajax({
                        url: "/unique_reviews_trials",
                        type: 'GET',
                        contentType: 'application/json;charset=UTF-8',
                        success: function (data) {
                            data = JSON.parse(data)['data'];
                            $("#link_counts").html(
                                '<a href="/browse">' + data['reviews'] + ' <small  style="color: #337ab7 !important;">systematic reviews</small></a><small> connected to</small>' + data['trials'] + ' <small>trials</small>'
                            );
                            $("#link_counts").fadeIn(1000);

                        }
                    });


                });
            }
            if (window.location.pathname === '/blank') {
                $(document).ready(function () {
                    $(document).on("click", "#submit_text", function (e) {
                        var text = $("#free_text").val();
                        socket.emit('freetext_trials', {'text': text});
                    });
                });
            }
        });

        socket.on('search_update', function (msg) {
            console.log(msg);

            $("#progress_txt").text(msg['msg']);
            if (msg['msg'] === 'complete') {
                $(".progress-div").attr('style', 'display:none;');

            }
        });
        socket.on('search_res', function (msg) {

            $("#progress_txt").text(msg['msg']);
            console.log(msg['msg']);
        });


        socket.on('test', function (msg) {
            console.log(msg['msg']);
        });

        socket.on('docsim_update', function (msg) {
            if (!$(".progress_basicbot").is(":visible")) {
                $(".progress_basicbot").slideDown(1000);
            }

            $("#progress_txt_basicbot").text(msg['msg']);
            if (msg['msg'].indexOf('complete') > -1) {
                socket.emit('refresh_trials', {
                    'review_id': getUrlParameter('searchterm'),
                    'type': 'rel',
                    'plot': true
                });
                $(".progress_basicbot").delay(1000).slideUp(2000);

            }
            console.log(msg['msg']);
        });

        socket.on('crossrefbot_update', function (msg) {
            if (!$(".progress_crossrefbot").is(":visible")) {
                $(".progress_crossrefbot").slideDown(1000);
            }
            $("#progress_txt_crossrefbot").text(msg['msg']);
            if (msg['msg'].indexOf('complete') > -1) {
                socket.emit('refresh_trials', {
                    'review_id': getUrlParameter('searchterm'),
                    'type': 'incl',
                    'plot': true
                });
                $(".progress_crossrefbot").delay(1000).slideUp(2000);

            }
            console.log(msg['msg']);
        });

        socket.on('cochranebot_update', function (msg) {
            console.log(msg);
            if (!$(".progress_cochranebot").is(":visible")) {
                $(".progress_cochranebot").slideDown(1000);
            }
            $("#progress_txt_cochranebot").text(msg['msg']);
            if (msg['msg'].indexOf('complete') > -1) {
                socket.emit('refresh_trials', {
                    'review_id': getUrlParameter('searchterm'),
                    'type': 'incl',
                    'plot': true
                });
                if (msg['refresh_both']) {
                    socket.emit('refresh_trials', {
                        'review_id': getUrlParameter('searchterm'),
                        'type': 'rel',
                        'plot': true
                    });

                }
                $(".progress_cochranebot").delay(1000).slideUp(2000);

            }
            console.log(msg['msg']);
        });

        socket.on('basicbot2_update', function (msg) {
            if (!$(".progress_basicbot2").is(":visible")) {
                $(".progress_basicbot2").slideDown(1000);
            }
            $("#progress_txt_basicbot2").text(msg['msg']);
            if (msg['msg'].indexOf('complete') > -1) {
                socket.emit('refresh_trials', {
                    'review_id': getUrlParameter('searchterm'),
                    'type': 'rel',
                    'plot': true
                });
                $(".progress_basicbot2").delay(1000).slideUp(2000);

            }
            console.log(msg['msg']);
        });

        socket.on('new_page', function (msg) {
            // console.log(msg['data']);
            // todo replace this with something faster and more scalable
            $('.pg_content').html(msg['data']);
        });

        var getUrlParameter = function getUrlParameter(sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        };


        var upvote_callback = function (data) {
            console.log('voted ajax');
            $.ajax({
                url: '/vote',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    id: data.id,
                    up: data.upvoted,
                    down: data.downvoted,
                    star: data.starred,
                    review: getUrlParameter('searchterm')
                }),
                error: function (data2) {
                    var modal = $("#myModal");
                    modal.find('.modal-body p').text(data2['responseText']);
                    modal.modal();
                    if (data.upvoted) {
                        $("#" + data.id + '_vote > a.upvote').removeClass('upvote-on');

                    } else {
                        $("#" + data.id + '_vote > a.downvote').removeClass('downvote-on');

                    }
                },
                success: function (data1) {
                    var result = JSON.parse(data1);
                    $("#panel_" + data.id + " a.nicknames").html(result['voters']);

                }
            });
        };


        $('div.upvote').upvote({
            callback: upvote_callback
        });

        function move_rel_incl(nct_id) {
            disable_elements();
            var panel = $('#panel_' + nct_id);
            var category = 'incl';
            relevant_included(nct_id, function (data) {
                panel.fadeOut("slow", function () {
                    panel.remove();
                    var result = JSON.parse(data);
                    // $("#accordion-incl").fadeOut('slow');
                    // reload_trials('incl');
                    socket.emit('refresh_trials', {
                        'review_id': getUrlParameter('searchterm'),
                        'type': 'incl',
                        'plot': true
                    });
                    socket.emit('trigger_basicbot2', {
                        'review_id': getUrlParameter('searchterm')
                    });
                    $('#alert-place-' + category).show();
                    $('#alert-place-' + category).html('<div class="alert alert-success "> <strong>Thank you! </strong>' + result['message'] + '</div>');
                    $('#alert-place-' + category).delay(3000).fadeOut("slow");
                });

                enable_elements();

            });
        }


        $(document).on("click", ".rel_incl", function (e) {
            var nct_id = e.target.id.substring(0, 11);
            move_rel_incl(nct_id);
        });

        $(document).on("click", ".rec_rel_incl", function (e) {
            var nct_id = e.target.id.substring(0, 11);
            var panel = $('#panel_' + nct_id);
            $(panel).detach().appendTo('#accordion-incl');
            $('#'+nct_id+'_movincl').css('visibility', 'hidden');
        });


        $(document).on("click", ".save_review", function (e) {
            var val = true;
            var review_id = this.id;
            if (typeof ($(this).attr('active')) === 'undefined') {
                val = false;
            }
            console.log(val);

            $.ajax({
                url: "/save_review",
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    review_id: review_id,
                    value: val
                }),

                error: function (data2) {
                    var modal = $("#myModal");
                    modal.find('.modal-body p').text(data2['responseText']);
                    modal.modal();

                },
                success: function (data) {
                    console.log(data);
                }

            });
        });


        function move_incl_rel(nct_id) {
            disable_elements();
            var category = 'incl';
            var panel = $('#panel_' + nct_id);
            included_relevant(nct_id, function (data) {
                if ($("#accordion-incl > .panel").length === 1) {
                    // $("#accordion-incl").fadeOut('1000', function () {
                    console.log(
                        'emitting'
                    );
                    socket.emit('refresh_trials', {
                        'review_id': getUrlParameter('searchterm'),
                        'type': 'incl',
                        'sort': 'net_upvotes',
                        'plot': false
                        // });
                    });
                } else {
                    panel.fadeOut("slow", function () {
                        panel.remove();
                        refresh_dashboard();
                    });
                }
                var result = JSON.parse(data);
                // $("#accordion-rel").fadeOut('slow');
                socket.emit('refresh_trials', {
                    'review_id': getUrlParameter('searchterm'),
                    'type': 'rel',
                    'plot': true
                });

                $('#alert-place-' + category).show();
                $('#alert-place-' + category).html('<div class="alert alert-success "> <strong>Thank you! </strong>' + result['message'] + '</div>');
                $('#alert-place-' + category).delay(3000).fadeOut("slow", function () {
                    enable_elements();
                });
            });
        }


        function calc_completeness() {
            var rel_trials = 0;
            var rel_participants = 0;
            $(".rel-check:checked").each(function () {
                rel_trials += 1;
                if (parseInt($(this).attr('value'))) {
                    rel_participants += parseInt($(this).attr('value'));
                }

            });
            $("#num_rel_trials").text(rel_trials);
            $("#part_rel_trials").text(rel_participants);
        }

        $(document).on("click", '#reset_cmp', function (e) {
            $(".rel-check:checked").each(function () {
                $(this).prop('checked', false);
            });
            calc_completeness();
        });


        $(document).on("click", '.sort .btn', function (e) {
            var order = $(this).attr('id');
            var side = '';
            if ($(this).hasClass('incl')) {
                side = 'incl'
            } else {
                side = 'rel'
            }
            console.log(side);
            console.log('click');
            console.log(order);

            socket.emit('refresh_trials', {
                'review_id': getUrlParameter('searchterm'),
                'type': side,
                'sort': order,
                'plot': false
            });

        });

        $(document).on("click", "#cmp_btn", function (e) {
            console.log('click calc!');
            $("#completeness_val").css('visibility', 'visible');
            $("#cmp_btn").css('visibility', 'hidden');
            $("#reset").css('visibility', 'visible');
            $(".form-check-input").css('visibility', 'visible');
            calc_completeness()
        });


        $(document).on("click", ".btn-incl-cmp", function (e) {
            var complete = e.target.value;
            update_included_complete(complete, function (data) {
                $(".btn-incl-cmp").fadeOut(1000);

                var result = JSON.parse(data);
                $('#alert-place-incl').html('<div class="alert alert-success">  <strong>' + result['message'] + '</strong></div>');
                $('#alert-place-incl').delay(3000).fadeOut("slow");
                $('#accordion-incl').slideUp(2000);
                socket.emit('refresh_trials', {
                    'review_id': getUrlParameter('searchterm'),
                    'type': 'incl',
                    'plot': false
                });

                if (complete === 'True') {
                    socket.emit('trigger_basicbot2', {
                        'review_id': getUrlParameter('searchterm')
                    });

                    $('.rel_incl').css('visibility', 'hidden');
                    $(".btn-incl-cmp").val('False');
                    $(".btn-incl-cmp").html('This list is incomplete');
                }
                else {
                    console.log('complete is not true');

                    $('.rel_incl').css('visibility', 'visible');
                    $(".btn-incl-cmp").val('True');
                    $(".btn-incl-cmp").html('This list is complete');
                }
                $(".btn-incl-cmp").fadeIn(1000);

            });
        });

        $(document).on("change", ".form-check-input:checkbox", function (e) {
            calc_completeness();
        });


        function disable_elements() {
            console.log('disabling');
            $(".nct-submit").attr('disabled', true);
            $(".upvote").attr('disabled', true);
            $(".downvote").attr('disabled', true);
            $(".dismiss").attr('disabled', true);
            $(".btn-incl-cmp").attr('disabled', true);
            $(".rel_incl").attr('disabled', true);
        }

        function enable_elements() {
            console.log('emabling');
            $(".nct-submit").attr('disabled', false);
            $(".upvote").attr('disabled', false);
            $(".downvote").attr('disabled', false);
            $(".dismiss").attr('disabled', false);
            $(".btn-incl-cmp").attr('disabled', false);
            $(".rel_incl").attr('disabled', false);
        }


        $(document).on("click", ".nct-submit", function (e) {
            console.log('clicked +');
            var re_nct = /(NCT|nct)[0-9]{8}/;
            var category = e.target.name;
            var nct_id = $('#' + category + '-id').val().trim();
            if (re_nct.test(nct_id)) {
                console.log(getUrlParameter('searchterm'));
                var accordion = $('#accordion-' + category);
                disable_elements();
                submitTrial(nct_id, (category.indexOf('incl') > -1 ? 'included' : 'relevant'), function (data) {
                    var result = JSON.parse(data);
                    if (result['success'] == true) {
                        accordion.fadeOut('slow');
                        $('#alert-place-' + category).html('<div class="alert alert-success">  <strong>Thank you! </strong>' + result['message'] + '</div>');
                        $('#alert-place-' + category).show();
                        $('#alert-place-' + category).delay(3000).fadeOut("slow", function () {
                            enable_elements();
                        });

                        $('#accordion-' + category).prepend('');
                        // reload_trials(category);
                        socket.emit('refresh_trials', {
                            'review_id': getUrlParameter('searchterm'),
                            'type': category,
                            'plot': true
                        });
                        if (category.indexOf('incl') > -1) {
                            socket.emit('trigger_basicbot2', {
                                'review_id': getUrlParameter('searchterm')
                            });
                        }

                    } else {
                        $("#panel_" + nct_id)[0].scrollIntoView({behaviour: "smooth"});
                        $("#panel_" + nct_id + "> .panel-heading").effect("highlight", {}, 3000);
                        if (result['move']) {
                            $('#alert-place-' + category).html('<div class="alert alert-info "> <strong>Uh oh! </strong>' + result['message'] + '   <a class="btn btn-xs btn-primary pull-right move-trial">Move to this list</a></div>');
                        }
                        else {
                            $('#alert-place-' + category).html('<div class="alert alert-info "> <strong>Uh oh! </strong>' + result['message'] + '  </div>');
                        }
                        $('#alert-place-' + category).fadeIn(1000);
                        $('#alert-place-' + category).delay(3000).fadeOut(1000, function () {
                            enable_elements();

                        });
                        $(document).on("click", ".move-trial", function (e) {
                            if (category === 'incl') {
                                $('#alert-place-' + category).html('');
                                move_rel_incl(nct_id);
                            } else if (category === 'rel') {
                                $('#alert-place-' + category).html('');
                                move_incl_rel(nct_id);
                            }
                        });
                    }
                });

            } else {
                $('#alert-place-' + category).html('<div class="alert alert-warning "><strong>Uh oh!</strong> Please enter a valid ClinicalTrials.gov registry ID</div>');
                $('#alert-place-' + category).fadeIn(400, function () {
                    $('#alert-place-' + category).delay(2000).fadeOut("slow", function () {
                        enable_elements();

                    });

                });
            }
        });

        $(document).on("click", ".row .dismiss", function (e) {
            var nct_id = e.target.id.substring(8);
            move_incl_rel(nct_id)
        });


        function update_included_complete(complete, callback) {
            $.ajax({
                url: "/included_complete",
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    review_id: getUrlParameter('searchterm'),
                    value: complete
                }),
                error: function (data2) {

                    var modal = $("#myModal");
                    modal.find('.modal-body p').text(data2['responseText']);
                    modal.modal();

                },
                success: function (data) {
                    callback(data);
                }

            });
        }


        function included_relevant(nct_id, callback) {
            $.ajax({
                url: "/included_relevant",
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    nct_id: nct_id,
                    review: getUrlParameter('searchterm')
                }),
                success: function (data) {
                    callback(data);
                },
                error: function (data2) {
                    var modal = $("#myModal");
                    modal.find('.modal-body p').text(data2['responseText']);
                    modal.modal();

                }
            });
        }

        function relevant_included(nct_id, callback) {
            $.ajax({
                url: "/relevant_included",
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    nct_id: nct_id,
                    review: getUrlParameter('searchterm')
                }),
                success: function (data) {
                    callback(data);
                },
                error: function (data2) {
                    var modal = $("#myModal");
                    modal.find('.modal-body p').text(data2['responseText']);
                    modal.modal();

                }
            });
        }


        function submitTrial(id, relationship, callback) {
            $.ajax({
                url: "/submittrial",
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({
                    nct_id: id,
                    relationship: relationship,
                    review: getUrlParameter('searchterm')
                }),
                success: function (data) {
                    callback(data);
                },
                error: function (data2) {
                    var modal = $("#myModal");
                    modal.find('.modal-body p').text(data2['responseText']);
                    modal.modal();

                }
            });
        }


    }
)
;

