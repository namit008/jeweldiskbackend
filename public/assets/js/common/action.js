$(document).ready(function () {

    $('#inquiry_submit').click(function (event) {
        event.preventDefault();
        uname = $('#inquiry_uname').val();
        uemail = $('#inquiry_email').val();
        uphone = $('#inquiry_phone').val();
        desc = $('#inquiry_desc').val();

        var inquiry = { 'name': uname, 'email': uemail, 'phone_no': uphone, 'desc': desc };

        if (!uname || !uemail || !uphone || !desc) {
            alert("All Fields are required");
        }
        else if (!isValidEmailAddress(uemail)) {
            alert("Please enter valid email")
        }
        else {
            $.ajax({
                type: 'POST',
                url: '/add-inquiry',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    urll: urll,
                    inquiry
                }),
                success: function (data) {
                    $('#inquiry-alert').show()
                    $('#inquiry-alert-msg').html(data.message).css("color", "green");
                    $('#Inquiry').find("input, textarea").val("");
                    setTimeout(() => {
                        $('#inquiry-alert').hide()
                    }, 3000);
                },
                error: function (err) {
                    let errMessage = errorHandling(err)
                    $('#inquiry-alert').show()
                    $('#inquiry-alert-msg').html(errMessage).css("color", "red");
                    setTimeout(() => {
                        $('#inquiry-alert').hide()
                    }, 3000);
                }
            })
        }
    })
    $('#review_submit').click(function (event) {
        event.preventDefault();
        rating = $('#selected_rating').text().match(/\d+/);
        name = $('#review_uname').val();
        uemail = $('#review_email').val();
        uphone = $('#review_phone').val();
        desc = $('#review_comment').val();
        console.log(`${name, uemail, uphone, desc, rating}`)
        const review = { 'name': name, 'desc': desc, 'rating': parseInt(rating[0]) }
        if (!name || !uemail || !uphone || !desc) {
            alert("Empty fields");
        }
        else if (!isValidEmailAddress(uemail)) {
            alert("email is not valid")
        }
        else {
            $.ajax({
                type: 'POST',
                url: '/add-review',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    urll: urll,
                    review: review
                }),
                success: function (data) {
                    $('#review').find("input, textarea").val("");
                    $('#selected_rating').text("")
                    $('#rating_001 i').removeClass('fa-star');
                    $('#rating_001 i').addClass('fa-star-o');


                    reviews.unshift(review);
                    loadReviews(0);
                    averageRatingContainer(reviews)

                    $('#review-alert').show()
                    $('#review-alert-msg').html(data.message).css("color", "green");
                    setTimeout(() => {
                        $('#review-alert').hide()
                    }, 3000);
                },
                error: function (err) {
                    $('#review-alert').show()
                    $('#review-alert-msg').html(errMessage).css("color", "red");
                    setTimeout(() => {
                        $('#review-alert').hide()
                    }, 3000);
                }
            })
        }
    })

    $('#rating_001 i').on('click', function () {
        var onStar = parseInt($(this).data('value'), 10); // The star currently selected
        var stars = $(this).parent().children('i.fa');
        console.log("onStar", onStar)

        console.log("stars", stars)

        for (i = onStar; i < stars.length; i++) {
            $(stars[i]).removeClass('fa-star');
            $(stars[i]).addClass('fa-star-o');
        }

        for (i = 0; i < onStar; i++) {
            $(stars[i]).removeClass('fa-star-o');
            $(stars[i]).addClass('fa-star');
        }

        var ratingValue = parseInt($('.rating-star i.fa-star').last().data('value'), 10);
        $('#selected_rating').text(ratingValue + ' Star')
    });


    $("#card_share_btn").on('click', function () {
        html2canvas($('#front_card'), {
            onrendered: function (canvas) {
                var imgString = canvas.toDataURL("image/png");
                var a = document.createElement('a');
                try {
                    if (!navigator.share) throw new Error('Share not working');
                    else {
                        canvas.toBlob(function(blob){
                            navigator.share({ files: [new File([blob], 'card.png', { type: 'image/png' })] }), 'image/png';
                        }, 'image/png')
                    }
                } catch (err) {
                    console.log(err);
                    a.href = imgString;
                    a.download = "image.png";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }
        })
    });

    loadImages(0);
    loadVideos(0);

    loadReviews(0);
    averageRatingContainer(reviews)

    $('#image_prev_btn').on('click', function (event) {
        event.preventDefault();
        if (currentImagePage > 0) {
            loadImages(currentImagePage - 1);
        }
        return false;
    });

    $('#image_next_btn').on('click', function (event) {
        event.preventDefault();
        console.log(currentImagePage, images.length, pageImageSize)
        if (currentImagePage + 1 < images.length / pageImageSize) {
            loadImages(currentImagePage + 1);
        }
        return false;
    });
    $('#video_prev_btn').on('click', function (event) {
        event.preventDefault();
        if (currentVideoPage > 0) {
            loadVideos(currentVideoPage - 1);
        }
        return false;
    });

    $('#video_next_btn').on('click', function (event) {
        event.preventDefault();
        if (currentVideoPage + 1 < videos.length / pageVideoSize) {
            loadVideos(currentVideoPage + 1);
        }
        return false;
    });
    $('#review_prev_btn').on('click', function (event) {
        event.preventDefault();
        if (currentReviewPage > 0) {
            loadReviews(currentReviewPage - 1);
        }
        return false;
    });

    $('#review_next_btn').on('click', function (event) {
        event.preventDefault();
        if (currentReviewPage + 1 < reviews.length / pageReviewSize) {
            loadReviews(currentReviewPage + 1);
        }
        return false;
    });


});

// Image pagination
var currentImagePage = 0, pageImageSize = 9;
function loadImages(page) {
    if (currentImagePage == 0) {
        $('#image_prev_btn').prop('disabled', true);
    }
    if (currentImagePage + 1 >= images.length / pageImageSize) {
        $('#image_next_btn').prop('disabled', true);
    }
    currentImagePage = page;
    offset = page * pageImageSize;

    var result = "";
    for (var i = offset; i < Math.min(images.length, offset + pageImageSize); i++) {
        result += `<li style="position: relative;">
                        <a class="image-popup-vertical-fit" href="${images[i]}">
                            <img style="object-fit: cover; object-position: center; width: 100%; height: 100%; position: absolute; top: 0; bottom: 0; left: 0; right: 0;" class="img-responsive" src="${images[i]}">
                        </a></li>`;
    }
    $('#image_container').html(result);
    var cw = $('#image_container li').width();
    $('#image_container li').css({'height':cw+'px'});
    
    changePaginationText('image_pagi_text', currentImagePage, Math.ceil(images.length / pageImageSize))
    magnificPopupCaller();
}

// Video pagination
var currentVideoPage = 0, pageVideoSize = 3;
function loadVideos(page) {
    if (currentVideoPage == 0) {
        $('#video_prev_btn').prop('disabled', true);
    }
    if (currentVideoPage + 1 >= videos.length / pageVideoSize) {
        $('#video_next_btn').prop('disabled', true);
    }
    currentVideoPage = page;
    offset = page * pageVideoSize;

    var result = "";
    for (var i = offset; i < Math.min(videos.length, offset + pageVideoSize); i++) {
        result += '<li><iframe width="100%" height="200" src="https://www.youtube.com/embed/' + videos[i] + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></li>'
    }
    $('#video_container').html(result);
    changePaginationText('video_pagi_text', currentVideoPage, Math.ceil(videos.length / pageVideoSize))
}


// Review pagination
var currentReviewPage = 0, pageReviewSize = 3;
function loadReviews(page) {
    if (reviews.length > 0) {
        if (currentReviewPage == 0) {
            $('#review_prev_btn').prop('disabled', true);
        }
        if (currentReviewPage + 1 >= reviews.length / pageReviewSize) {
            $('#review_next_btn').prop('disabled', true);
        }
        currentReviewPage = page;
        offset = page * pageReviewSize;

        var result = "";
        for (var i = offset; i < Math.min(reviews.length, offset + pageReviewSize); i++) {
            console.log(reviews[i])
            let individualRating = '';
            for (let j = 0; j < reviews[i].rating; j++) {
                individualRating += '<i class="fa fa-star" aria-hidden="true"></i>';
            }
            for (let k = 0; k < 5 - reviews[i].rating; k++) {
                individualRating += '<i class="fa fa-star-o" aria-hidden="true"></i>';
            }
            result += '<div class="feedb"><div class="total-review">' + individualRating + '</div><p>' + reviews[i].desc + '</p><p><strong>' + reviews[i].name + '</strong></p></div>'
        }
        $('#reviews').show();
        $('#review_container').html(result);
        changePaginationText('review_pagi_text', currentReviewPage, Math.ceil(reviews.length / pageReviewSize))
    }
}

// Change pagination text
function changePaginationText(id, currentPage, numberOfPage) {
    var text = 'Total: ' + (currentPage + 1) + '/' + numberOfPage
    $('#' + id).text(text)
    return;
}

function errorHandling(err) {
    return err && err.responseJSON && err.responseJSON.message || 'Something Went Wrong'
}

function totalAverageRating1() {
    if (reviews.length) {
        let totalRating = reviews.reduce((a, review) => a + parseInt(review.rating), 0);
        var totalAverageRating = (totalRating / reviews.length);
        totalAverageRating = Math.round(totalAverageRating * 2) / 2
        return totalAverageRating;
    }
}

function calculateReviewPercentage(reviews, a) {
    let itemQuantity = reviews.filter(e => e.rating == a);
    if (itemQuantity.length) {
        return ((Number(itemQuantity.length) * 100) / Number(reviews.length)).toFixed()
    }
    return 0
}

function averageRatingContainer(reviews) {

    let totalAverageRating = totalAverageRating1();
    let averageStarRatingHtml = '';

    for (let i = 0; i < parseInt(totalAverageRating); i++) {
        averageStarRatingHtml += '<i class="fa fa-star" aria-hidden="true"></i>';
    }

    if (totalAverageRating > parseInt(totalAverageRating)) {
        averageStarRatingHtml += '<i class="fa fa-star-half-o" aria-hidden="true"></i>';
    } else {
        totalAverageRating < 5 ? averageStarRatingHtml += '<i class="fa fa-star-o" aria-hidden="true"></i>' : null;
    }

    for (let i = 0; i < 4 - parseInt(totalAverageRating); i++) {
        averageStarRatingHtml += '<i class="fa fa-star-o" aria-hidden="true"></i>';
    }



    let ratingBarContainer = "";
    for (let i = 5; i > 0; i--) {
        ratingBarContainer += `<div class="star-view clearfix"><div class="pull-left star-txt">${i} star</div>
            <div class="progress">
                <div class="progress-bar" role="progressbar" aria-valuenow=${calculateReviewPercentage(reviews, i)}
                    aria-valuemin="0" aria-valuemax="100" style="width: ${calculateReviewPercentage(reviews, i)}%">
                    <span class="sr-only">${calculateReviewPercentage(reviews, i)}% Complete</span>
                </div>
            </div> <div class="pull-left star-txt1">${calculateReviewPercentage(reviews, i)}%</div>
        </div>`
    }


    let container = `<li class="total-review">
        ${averageStarRatingHtml} &nbsp; <div style="display: inline;" id="total-average-rating"></div>${totalAverageRating} out of 5</li>
        <li class="total-review"><span><span id="totalRatingLength">${reviews.length}</span> customer ratings</span></li>
        <li class="clearfix">
            ${ratingBarContainer}
        </li>`

    $('#average-review-container').html(container)
    $('[data-toggle="tooltip"]').tooltip({trigger: 'manual'})
}

function shareCTA(urll) {
    try {
        if (!navigator.share) throw new Error('Share not working');
        else {
            navigator.share({ text: "Please visit my business card. ", url: 'https://jeweldisk.com/'+urll });
        }
    } catch (err) {
        console.log(err);
        navigator.clipboard.writeText('Please visit my business card. https://jeweldisk.com/'+urll);
        $('[data-toggle="tooltip"]').tooltip('show');
        setTimeout(function() {
            $('[data-toggle="tooltip"]').tooltip('hide');
        }, 1000);
    }
}

function downloadVcard(org, name, phone, address) {
    var contact = vCard.create(vCard.Version.FOUR)
    contact.addFormattedname(name)
    contact.addOrganization(org)
    contact.addPhone(phone, vCard.Type.WORK)
    contact.addAddress(address.line1 +' '+ address.line2, address.pincode, address.city +' '+address.state , address.country, vCard.Type.WORK)
    vCard.export(contact, "contact", true);
}