"use strict";

let dbRefPosts;
// let dbRefPostsIds;
// let dbRefTotalIds;
// let ids = [];
var posts = new Object();

let hasTopic = false;
let hasDescription = false;

// posting views
let postingTopic;
let postingDescription;
let uploadImgForm;
let attachedImg;
let clearImgBtn;
let launchBtn;


$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB4OkQ7YqMHIvsFop93jME2TQoJAainsBQ",
        authDomain: "together-cb.firebaseapp.com",
        databaseURL: "https://together-cb.firebaseio.com",
        projectId: "together-cb",
        storageBucket: "together-cb.appspot.com",
        messagingSenderId: "631052340251"
    };
    firebase.initializeApp(config);

    // Create firebase database references 
    const dbRef = firebase.database().ref();
    dbRefPosts = dbRef.child('posts');
    // dbRefPostsIds = dbRef.child('ids');
    // dbRefTotalIds = dbRef.child('totalIds');
    const dbRefTopic = dbRefPosts.child('topic');
    const dbRefDescription = dbRefPosts.child('description');

    // Sync challenges changes
    // dbRefPostsIds.once('value', snap => { 
    //     var numIds = snap.numChildren();
    //     for (var i = 0; i < numIds; i++) {
    //         ids.push(snap.child('' + i).val());
    //     }
    // });

    dbRefPosts.once('value', snap => {
        posts = Object.assign({}, snap.val()); 
        // load posts
        loadPosts();
    });

    // Sync topic and description changes

    // get elements
    postingTopic = document.getElementById("we-share-topic");
    postingDescription = document.getElementById("we-share-description");
    launchBtn = document.getElementById("launch-btn");
    // disable the launch until there's a valid text
    launchBtn.style.pointerEvents = 'none';
    uploadImgForm = document.forms[0].elements;
    attachedImg = document.getElementById('attach-img');
    // hide the image preview until the user attachs something
    attachedImg.style.display = "none";
    clearImgBtn = document.getElementById('clear-img-btn');
    // hide the clear image button until the user attachs something
    clearImgBtn.style.display = "none";

    // EVENT HANDLERS
    // check if the topic is valid
    postingTopic.addEventListener('input', function() {
        if (postingTopic.value.trim() == '') {
            hasTopic = false;
        } else {
            hasTopic = true;
        }
        if (launchBtn != null) {
            enableLaunchButton();
        }
    }, false);
    // check if the description is valid
    postingDescription.addEventListener('input', function() {
        if (postingDescription.value.trim() == '') {
            hasDescription = false;
        } else {
            hasDescription = true;
        }
        if (launchBtn != null) {
            enableLaunchButton();
        }
    }, false);
    // launch a new post
    launchBtn.onclick = function() {
        addNewPost(postingTopic.value, postingDescription.value);
        clearTextareas();
    };
    // clear attach image
    clearImgBtn.onclick = function(){
      clearInputFile(uploadImgForm[0]);
    };
});


// LOAD POSTS FUNCTION
function loadPosts() {
    for(const id in posts) {
        if(posts.hasOwnProperty(id)) {
            var post = posts[id];
            writeNewPost(post['topic'], post['description']);
        }
    }
}

// MANAGE POSTS FUNCTIONS
function addNewPost(topic, description) {
    // A post entry.
    var postData = {
    topic: topic,
    description: description
    };

    // Get a key for a new Post.
    var newPostKey = dbRefPosts.push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/posts/' + newPostKey] = postData;

    // add a new id
    // ids.push(newPostKey);
    // dbRefPostsIds.set(ids);    

    writeNewPost(topic, description);
    return firebase.database().ref().update(updates);
}

function writeNewPost(topic, description) {
    // create a new div element 
    var newDiv = document.createElement("div"); 
    newDiv.className = "we-share-new";
    var newTopic = document.createElement("textarea");
    var newDescription = document.createElement("textarea");
    // and give them the contents
    // var newTopicContent = document.createTextNode(topic); 
    newTopic.value = topic;
    newDescription.value = description;

    // add the text node to the newly created div
    newDiv.appendChild(newTopic);  
    newDiv.appendChild(newDescription); 
    styleNewPost(newDiv, newTopic, newDescription);
    // add the newly created element and its content into the DOM 
    // Get a reference to the element in which we want to insert a new node
    var parentElement = document.getElementById('news-placeholder');
    // Get a reference to the first child
    var theFirstChild = parentElement.firstChild;
    // Insert the new element before the first child
    parentElement.insertBefore(newDiv, theFirstChild);
}

function styleNewPost(div, topic, description) {
    div.style.marginBottom = "8px";
    div.style.borderBottom = "1px solid #e6e6e6";
    topic.style.fontWeight = "bold";
    topic.style.fontFamily = "Open Sans, sans-serif";
    description.style.fontFamily = "Open Sans, sans-serif";
    topic.readOnly = true;
    description.readOnly = true;
    topic.style.cursor = "default";
    description.style.cursor = "default";
    description.rows = "4";
}


// ENABLE LAUNCH BUTTON IF TEXTS ARE VALID
function enableLaunchButton() {
    if (hasTopic && hasDescription) {
        launchBtn.style.pointerEvents = 'auto';
    } else {
        launchBtn.style.pointerEvents = 'none';
    }
}

// Clear text areas
function clearTextareas() {
    postingTopic.value = "";
    postingDescription.value = "";
}

// Show image preview
function previewImg() {
  
  var imgInput = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.onloadend = function () {
    attachedImg.src = reader.result;
  }

  if (imgInput) {
    reader.readAsDataURL(imgInput);
    if (attachedImg.style.display === "none") {
        attachedImg.style.display = "inline-block";

    }
    if (clearImgBtn.style.display === "none") {
        clearImgBtn.style.display = "inline-block";
    }
  } else {
    attachedImg.src = "#";
    attachedImg.style.display = "none";
    clearImgBtn.style.display = "none";
  }
}

// clear attached image
function clearInputFile(f){
  if(f.value){
    try{
      f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
      attachedImg.src = "#";
      attachedImg.style.display = "none";
      clearImgBtn.style.display = "none";
    }catch(err){
    }
    if(f.value){ //for IE5 ~ IE10
      var form = document.createElement('form'), ref = f.nextSibling;
      form.appendChild(f);
      form.reset();
      ref.parentNode.insertBefore(f,ref);
      attachedImg.src = "#";
      attachedImg.style.display = "none";
      clearImgBtn.style.display = "none";
    }
  }
}





// SNOWING BG

(function ($) {
    //
    // Zachary Johnson
    // https://www.zachstronaut.com/posts/2009/12/21/happy-xmas-winternet.html
    // December 2009
    //
    
    var ww = 0;
    var wh = 0;
    var maxw = 0;
    var minw = 0;
    var maxh = 0;
    var textShadowSupport = true;
    var xv = 0;
    var snowflakes = ["\u2744", "\u2745", "\u2746"];
    var prevTime;
    var absMax = 20;
    var flakeCount = 0;
    
    $(init);

    function init()
    {
        var detectSize = function ()
        {
            ww = $(window).width();
            wh = $(window).height();
            
            maxw = ww + 300;
            minw = -300;
            maxh = wh + 300;
        };
        
        detectSize();
        
        $(window).resize(detectSize);
        
        if (!$('body').css('textShadow'))
        {
            textShadowSupport = false;
        }
        
        /* Should work in Windows 7 /*
        if (/windows/i.test(navigator.userAgent))
        {
            snowflakes = ['*']; // Windows sucks and doesn't have Unicode chars installed
            //snowflakes = ['T']; //No FF support for Wingdings
        }
        */
        
        // FF seems to just be able to handle like 50... 25 with rotation
        // Safari seems fine with 150+... 75 with rotation
        var i = 50;
        while (i--)
        {
            addFlake(true);
        }
        
        prevTime = new Date().getTime();
        setInterval(move, 50);
    }

    function addFlake(initial)
    {
        flakeCount++;
        
        var sizes = [
            {
                r: 1.0,
                css: {
                    fontSize: 15 + Math.floor(Math.random() * 20) + 'px',
                    textShadow: '9999px 0 0 rgba(238, 238, 238, 0.5)'
                },
                v: 2
            },
            {
                r: 0.6,
                css: {
                    fontSize: 50 + Math.floor(Math.random() * 20) + 'px',
                    textShadow: '9999px 0 2px #eee'
                },
                v: 6
            },
            {
                r: 0.2,
                css: {
                    fontSize: 90 + Math.floor(Math.random() * 30) + 'px',
                    textShadow: '9999px 0 6px #eee'
                },
                v: 12
            },
            {
                r: 0.1,
                css: {
                    fontSize: 150 + Math.floor(Math.random() * 50) + 'px',
                    textShadow: '9999px 0 24px #eee'
                },
                v: 20
            }
        ];
    
        var $nowflake = $('<span class="winternetz">' + snowflakes[Math.floor(Math.random() * snowflakes.length)] + '</span>').css(
            {
                /*fontFamily: 'Wingdings',*/
                color: '#694377',
                display: 'block',
                position: 'fixed',
                background: 'transparent',
                width: 'auto',
                height: 'auto',
                margin: '0',
                padding: '0',
                textAlign: 'left',
                zIndex: 9999
            }
        );
        
        if (textShadowSupport)
        {
            $nowflake.css('textIndent', '-9999px');
        }
        
        var r = Math.random();
    
        var i = sizes.length;
        
        var v = 0;
        
        while (i--)
        {
            if (r < sizes[i].r)
            {
                v = sizes[i].v;
                $nowflake.css(sizes[i].css);
                break;
            }
        }
    
        var x = (-300 + Math.floor(Math.random() * (ww + 300)));
        
        var y = 0;
        if (typeof initial == 'undefined' || !initial)
        {
            y = -300;
        }
        else
        {
            y = (-300 + Math.floor(Math.random() * (wh + 300)));
        }
    
        $nowflake.css(
            {
                left: x + 'px',
                top: y + 'px'
            }
        );
        
        $nowflake.data('x', x);
        $nowflake.data('y', y);
        $nowflake.data('v', v);
        $nowflake.data('half_v', Math.round(v * 0.5));
        
        $('body').append($nowflake);
    }
    
    function move()
    {
        if (Math.random() > 0.8)
        {
            xv += -1 + Math.random() * 2;
            
            if (Math.abs(xv) > 3)
            {
                xv = 3 * (xv / Math.abs(xv));
            }
        }
        
        // Throttle code
        var newTime = new Date().getTime();
        var diffTime = newTime - prevTime;
        prevTime = newTime;
        
        if (diffTime < 55 && flakeCount < absMax)
        {
            addFlake();
        }
        else if (diffTime > 150)
        {
            $('span.winternetz:first').remove();
            flakeCount--;
        }
        
        $('span.winternetz').each(
            function ()
            {
                var x = $(this).data('x');
                var y = $(this).data('y');
                var v = $(this).data('v');
                var half_v = $(this).data('half_v');
                
                y += v;
                
                x += Math.round(xv * v);
                x += -half_v + Math.round(Math.random() * v);
                
                // because flakes are rotating, the origin could be +/- the size of the flake offset
                if (x > maxw)
                {
                    x = -300;
                }
                else if (x < minw)
                {
                    x = ww;
                }
                
                if (y > maxh)
                {
                    $(this).remove();
                    flakeCount--;
                    
                    addFlake();
                }
                else
                {
                    $(this).data('x', x);
                    $(this).data('y', y);

                    $(this).css(
                        {
                            left: x + 'px',
                            top: y + 'px'
                        }
                    );
                    
                    // only spin biggest three flake sizes
                    if (v >= 6)
                    {
                        $(this).animate({rotate: '+=' + half_v + 'deg'}, 0);
                    }
                }
            }
        );
    }
})(jQuery);