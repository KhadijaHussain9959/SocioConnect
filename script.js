function setUserId(userLoggedInId) {
  var path = window.location.pathname; //"/socioConnect/messages.php"
  var args = window.location.search; //"?id=32"

  //to get id from url, slicing the url after "=" sign  
  var id = args.slice(args.search("=") + 1);

  if (path == "/socioConnect/main.php" || path == "/socioConnect/timeline.php") {
    var post = document.querySelectorAll(".post"); // Selecting all posts on page

    //If there are no posts
    if (post.length == 0)
      document.getElementById("loading").innerHTML = "No Posts To Show";
    //If there are less than 10 posts
    else if (post.length < 10)
      document.getElementById("loading").innerHTML = "No More Posts To Show";

    //If there are 10 posts
    else {
      var flag = document.getElementById("noMorePosts");
      //if no more flag is true
      if (flag.value == "true")
        document.getElementById("loading").innerHTML = "No More Posts To Show";
      //if there are more posts present
      else {
        if (!id && path == "/socioConnect/timeline.php") {
          // If it is your timeline
          var loading = `<a href="javascript:showNextPage('b')">Show More Posts</a>`;
        } else if (id) {
          // If it is someone else timeline
          var loading = `<a href="javascript:showNextPage('${id}')">Show More Posts</a>`;
        } else {
          // Not sure about this? ------------------------
          var loading = `<a href="javascript:showNextPage('a')">Show More Posts</a>`;
        }
        document.getElementById("loading").innerHTML = loading;
      }
    }
  } else if (path == "/socioConnect/messages.php") {
    // Selecting all messages on the page
    var msgs = document.querySelectorAll(".chat-message");

    if (msgs.length == 0) // If no messages
      document.getElementById("loading-messages").innerHTML =
        "No Messages To Show";
    else if (msgs.length < 10) // If not more than 10
      document.getElementById("loading-messages").innerHTML =
        "No More Messages To Show";
    else {
      // messages are not less than 10
      var flag = document.getElementById("noMoreMessages");
      if (flag.value == "true") // no more messages are there
        document.getElementById("loading-messages").innerHTML =
          "No More Messages To Show";
      else {
        // more messages are there
        if (id) {
          document.getElementById("loading-messages").innerHTML = `<a href="javascript:showNextPageMessages('${id}')">Show More Messages</a>`;
        }
      }
    }
  } else if (path == "/socioConnect/allNotification.php") {

    // Selecting all notifications on page
    var notis = document.querySelectorAll(".notification");
    if (notis.length == 0) // If no notis
      document.getElementById("loading-notis").innerHTML =
        "No Notifications To Show";
    else if (notis.length < 10) // if less than 10 notis
      document.getElementById("loading-notis").innerHTML =
        "No More Notifications To Show";
    else {
      // notis are not less than 10
      var flag = document.getElementById("noMoreNotis");
      if (flag.value == "true") // Not greater than 10 notis
        document.getElementById("loading-notis").innerHTML =
          "No More Messages To Show";
      else {
        // There are more notis more than 10
        document.getElementById("loading-notis").innerHTML = `<a href="javascript:showNextPageNotis()">Show More Notifications</a>`;
      }
    }
  } else if (path == "/socioConnect/allActivities.php") {
    // Selecting all recent activities on page
    var notis = document.querySelectorAll(".recent_activity ");
    if (notis.length == 0) // If no recent activity
      document.getElementById("loading-activities").innerHTML =
        "No Activities To Show";
    else if (notis.length < 10) // if less than 10
      document.getElementById("loading-activities").innerHTML =
        "No More Activities To Show";
    else {
      // if not less than 10
      var flag = document.getElementById("noMoreActivities");
      if (flag.value == "true") // if equal to 10 only
        document.getElementById("loading-activities").innerHTML =
          "No More Activities To Show";
      else {
        // more activities are there to render
        document.getElementById("loading-activities").innerHTML = `<a href="javascript:showNextPageActivities()">Show More Activities</a>`;
      }
    }
  }
  session_user_id = userLoggedInId; // No purpose yet
}

function showCommentField(id) {
  // Displaying comment section when comment button is clicked
  document.getElementById("comment-section-" + id).classList.toggle("hidden");
}

function like(postID) {
  ajaxCalls("GET", `like.php?like=${postID}`).then(function (result) {

    let value = result.trim(); // because there is a space in response (don't know why))

    // Displaying like count on post
    document.querySelector(`.like-count-${postID}`).innerHTML = `<i class='like-count-icon fas fa-thumbs-up'></i> ${value}`;

    // Changing state of like icon
    let icon = document.querySelector(`.post-${postID} .like-btn i`);
    icon.classList.toggle("blue");

    //Adding in recent activities if liked
    if (icon.classList[2]) { // If it has a class blue xD
      var activity_type = 0; // Activity - like

      // Ajax call for adding like activity in recent activity
      param = `target_id=${postID}&activity_type=${activity_type}`;
      ajaxCalls("POST", `recentActivityAjax.php`, param).then(function (result) {
        // Adding to the view
        addRecentActivity(result);
      });
    } else {

      // Means post has been disliked
      var activity_type = 4; // Unlike
      param = `target_id=${postID}&activity_type=${activity_type}`;

      ajaxCalls("POST", `recentActivityAjax.php`, param).then(function (result) {
        document.querySelector(".activities-content").innerHTML = result;
      });
    }
  });
}

function addRecentActivity(activity) {
  //Adding recent activity to the activity area
  // Getting the area
  var activitiesDiv = document.querySelector(".activities-content");

  // Inserting the new activity at the top
  activitiesDiv.innerHTML = activity + activitiesDiv.innerHTML;

  // If activities have become more than 10 , then just remove the bottom one from view
  if (findChildNodes(activitiesDiv) == 11) {

    document.querySelector(".show-more-activities").innerHTML =
      "<a href='allActivities.php' class='see-more'><span>See more</span></a>";

    //Removing bottom activity from the list
    var lastChild = activitiesDiv.getElementsByTagName("a")[10]; // 0 -> 9 are 10
    var removed = activitiesDiv.removeChild(lastChild); // returned the removed element

  } else if (findChildNodes(activitiesDiv) > 0) {
    // If activities were not more than 10
    document.querySelector(".show-more-activities").innerHTML =
      "<p class='see-more'>No More Activities to Show</p>";
  }
}

function findChildNodes(div) {
  // Count Child nodes the passed element
  var count = 0;
  for (i = 0; i < div.childNodes.length; i++) {
    if (div.childNodes[i].nodeType == 1) count++;
  }

  // Returning number of child nodes
  return count;
}


// Function for making all ajax calls using promise
function ajaxCalls(method, pathString, postParam = "", pic = "") {
  // Creating promise
  return new Promise(function (resolve, reject) {
    // Creating XHR object for AJAX Call
    var xmlhttp = new XMLHttpRequest();

    // If response has arrived for request made
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        // XMLHttpRequest.DONE == 4
        if (xmlhttp.status == 200) {
          // Return the response
          resolve(this.responseText);
        } else if (xmlhttp.status == 400) {
          // alert('REJECTEd : 400');
          reject("Rejected");
        } else {
          // alert('REJECTEd : other');
        }
      }
    };

    // Preparing request with method and filename
    xmlhttp.open(method, pathString, true);

    // If it is post request and pic is not attached
    if (postParam && pic == "") {
      // Setting up headers to be send in POST request
      xmlhttp.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
    }

    // Sending request
    xmlhttp.send(postParam);
  });
}

function comment(postID, user, profilePic) {
  // Adding comment to post

  // Getting targeted comemnt field
  var comment = document.querySelector(`input[name='comment_${postID}']`);

  // Extracting Value
  var commentValue = comment.value;

  var timeToShow = "Just Now";


  // Validating input to not to be empty
  if (!(commentValue.trim() == "")) { // trim() - removes white spaces leading and trailing (for empty comment)

    // Setting up parameters for POST request to the file
    var param = `comment=${comment.value}&post_id=${postID}`;

    ajaxCalls("POST", "comment.php", param).then(function (result) {
      // Added Comment ID is returned in response
      commentID = result.trim();

      document.querySelector(`.comment-area-${postID}`).innerHTML += `
  <div class='comment comment-${commentID}'>
                
  <div class='user-image'>
      <img src='${profilePic}' class='post-avatar post-avatar-30' />
  </div>
  
  <div class='comment-info'>
  <i class='tooltip-container far fa-trash-alt comment-delete' onclick='javascript:deleteComment(${commentID})'><span class='tooltip tooltip-right'>Remove</span></i>
  <i class="tooltip-container fas fa-edit comment-edit" onclick="javascript:editComment(${commentID},${postID},'${profilePic}','${timeToShow}')"><span class='tooltip tooltip-right'>Edit</span></i>
  <div class='comment-body'>
  <span class='comment-user'>${user} : </span>
  <span class='comment-text'>${comment.value}</span>
  <span class='comment-time'>${timeToShow}</span>
  </div>
  
  </div>
</div>
  `;

      comment.value = "";

      //Adding in recent activities
      var activity_type = 1;
      // targeted Content
      var commentDetails = postID + " " + commentID;
      param = `target_id=${commentDetails}&activity_type=${activity_type}`;
      ajaxCalls("POST", `recentActivityAjax.php`, param).then(function (result) {
        addRecentActivity(result);
      });
    });
  }
  // Pain in the ass xD
  return false;
}

function deletePost(postID) {
  // As the name suggests

  ajaxCalls("GET", `delete.php?id=${postID}`).then(function (result) {
    // Removing post from the view
    document.querySelector(`.post-${postID}`).style.display = "none";
  });
}



function addPost(user_id) {
  // Again the name suggests xD

  // Getting post content
  var post = document.querySelector("textarea[name='post']"); // Post
  var postPicData = document.querySelector("input[name='post-pic']"); // Post Pic
  var postPic = postPicData.files[0];

  var postContent = post.value; // Post text

  //Validating post content before uploading
  if (!(postContent.trim() == "") || postPic !== undefined) {

    // Making up data for sending along request
    var formData = new FormData();
    formData.append("file", postPic); // Picture
    formData.append("post", post.value);

    ajaxCalls("POST", "post.php", formData, "pic").then(function (result) {
      // Adding new post to post Area
      // Adding post to the top not bottom. Clue xD
      document.querySelector(".posts").innerHTML =
        result + document.querySelector(".posts").innerHTML;

      // Clearing the post text from new post area when it is posted
      document.querySelector("textarea[name='post']").value = " ";

      //Adding in recent activities
      var activity_type = 2;
      param = `activity_type=${activity_type}`;
      ajaxCalls("POST", `recentActivityAjax.php`, param).then(function (result) {
        addRecentActivity(result);
      });
    });
  }

  // Clearing the name of pic
  document.querySelector(".pic-name").innerHTML = "";
}

function hideEditDiv(postID, flag) {
  // Getting the parent DIV of actual post
  var parentDiv = document.querySelector(".post-content-" + postID);

  // Displaying actual post content
  document.querySelector(".actual-post-" + postID).style.display = "block";

  // Removing the edit post div from the view
  parentDiv.removeChild(document.querySelector(".edit-post-" + postID));

  // Displaying 'edited' text if post has been edited
  if (flag)
    document.querySelector(".post-edited-" + postID).innerHTML = "Edited";
}

function postPicSelected(container) {
  // For displaying name of the file which is selected when making post
  var postPic = document.querySelector("input[name='post-pic']").files[0];
  document.querySelector(".pic-name").innerHTML = postPic.name;

}

//Copied this function from above postPicSelected, just to check right now, in future both will be merged
function editedPostPicSelected(postID) {
  // Displaying selected pic name in edited mode
  var editForm = document.querySelector(".edit-post-" + postID);
  var postPic = editForm.querySelector("input[name='post-pic']").files[0];
  editForm.querySelector(".pic-name").innerHTML = postPic.name;
}

function showFileUpload(postID) {
  // Showing file upload button
  var editForm = document.querySelector(".edit-post-" + postID);
  editForm.querySelector(".upload-btn-wrapper").style.display = "inline-block";
}

function hideFileUpload(postID) {
  // Hiding file upload button
  var editForm = document.querySelector(".edit-post-" + postID);
  editForm.querySelector(".upload-btn-wrapper").style.display = "none";
}

function editPost(postID) {

  // if edit post div is not opened
  if (!document.querySelector(".edit-post-" + postID)) {

    //Current Post
    var post = document.querySelector(".actual-post-" + postID);

    //Current Post and picture
    var postPic = post.querySelector(".post-image-container");
    var postContent = post.getElementsByTagName("p")[0];

    //Hiding current post
    post.classList.toggle('hidden');

    //Creating a new div to display if it doesn't exist and get the edit input and inserting it in the same parent div, just before the div where text and pic were shown

    var div = document.createElement("div");
    div.setAttribute("class", "show edit-post edit-post-" + postID);
    div.innerHTML = `<form action="editPost.php" method='POST'>
          <textarea name="post" id="" cols="30" rows="10" class="post-input post-edit-${postID}">${
      postContent.innerHTML
      }</textarea>
          <br>
          <div class ="radio-buttons-edit">
            <label><input type="radio" name="edit-post-pic" value="editText" onclick="hideFileUpload(${postID})"> Edit text </label><br>
            <label><input type="radio" name="edit-post-pic" value="remove" onclick="hideFileUpload(${postID})"> Remove Current Photo</label><br>
            <label><input type="radio" name="edit-post-pic" value="keep" onclick="hideFileUpload(${postID})"> Keep Current Pic</label><br>
            <label><input type="radio" name="edit-post-pic" value="new" onclick="showFileUpload(${postID})"> Upload New Photo</label><br>
          </div> 
          <div class='upload-btn-wrapper' style="display:none;">
            <button class='pic-upload-btn'><i class='far fa-image'></i></button>
            <input type='file' name='post-pic' onchange='javascript:editedPostPicSelected(${postID})'  />
            <span class='pic-name'></span>
          </div>               
          <div class='edit-post-button-container'>
            <a  href="javascript:saveEditPost(${postID})"  class='edit-post-save-btn'>Save</a>
            <a  href="javascript:hideEditDiv(${postID},false)"  class='edit-post-cancel-btn'>Cancel</a>
          </div>
        </form>`;

    var parentDivForEditingArea = document.querySelector(".post-content-" + postID);

    // Adding edit post div before actual post din in post content div
    parentDivForEditingArea.insertBefore(div, post);
  }

  else {
    // If edited div is already there then hide it and show actual post
    document.querySelector(".edit-post-" + postID).classList.toggle('hidden');
    document.querySelector(".actual-post-" + postID).classList.toggle('hidden');
  }
}

function saveEditPost(postID) {
  //Getting post edit text
  var postContent = document.querySelector(".post-edit-" + postID);

  //Getting div in which edited values are present
  var editForm = document.querySelector(".edit-post-" + postID);

  //Getting picutre file
  var postPicData = editForm.querySelector("input[name='post-pic']");
  var postPic = postPicData.files[0];

  //If neither text nor pic was inserted
  if (!(postContent.value.trim() == "") || postPic !== undefined) {
    if (editForm.querySelector('input[name="edit-post-pic"]:checked')) {
      //Getting radio button value
      var action = editForm.querySelector('input[name="edit-post-pic"]:checked')
        .value;

      //If new is selected by no path is given for image
      if (
        action == "new" &&
        editForm.querySelector(".pic-name").innerHTML == ""
      ) {
        alert("Select Image to change image");
        return 0;
      }

      //Preparing formData for ajax call
      var formData = new FormData();
      formData.append("file", postPic);
      formData.append("postID", postID);
      formData.append("postContent", postContent.value);
      formData.append("action", action);

      ajaxCalls("POST", "postEdit.php", formData, "pic").then(function (result) {
        //Displaying original post div which was made hidden in previous function
        var post = document.querySelector(".actual-post-" + postID);
        //Storing edited status in the p tag
        post.getElementsByTagName("p")[0].innerHTML = postContent.value;

        //result CONTAINS THE PATH OF IMAGE
        //checking if the response path is empty, i.e no image is to be shown
        var imgDiv = post.querySelector(".post-image");
        if (result.trim() != "") {
          // div for image is already present then only updating its src, making display block bcozit might be made none due to line 443 (See if condition in the else block)
          if (imgDiv) {
            imgDiv.style.display = "block";
            imgDiv.src = result;
          }

          //if div isn't present then creating it from scratch
          else {
            var imgParentDiv = document.querySelector(".actual-post-" + postID);
            imgParentDiv.innerHTML += `<div class='post-image-container'><img src='${result}' class='post-image' /></div>`;
          }
        } else {
          //response was empty this means that there is no picture to show, so first check, if div for images is present then hide it
          if (imgDiv) imgDiv.style.display = "none";
        }

        //Now hide the editing div and write Edited in the header section of the post
        hideEditDiv(postID, true);
      });


    } else alert("Select Action to do on the image");
  } else {
    alert("Enter either a text or an image");
  }
}

function deleteComment(commentID) {
  // Deleting Comment specified by comment ID

  ajaxCalls("GET", `commentDelete.php?id=${commentID}`).then(function (result) {
    // taking comment out from view
    document.querySelector(`.comment-${commentID}`).style.display = "none";
  });
}

function saveEditComment(postID, commentID, user, profilePic, time) {

  // Adding comment to post

  // Getting post ID,content and user who posted comment from form

  // Getting comment value (edited)
  var comment = document.querySelector(`input[name='comment_edit_${commentID}']`);


  // Setting up parameters for POST request to the file
  var param = `comment=${comment.value}&comment_id=${commentID}`;

  //Showing post comment form
  // document.querySelector(`.comment-form-${postID}`).style.display = 'flex';

  ajaxCalls("POST", "commentEdit.php", param)
    .then(function (result) {
      showComment(user, commentID, postID, profilePic, time, comment.value, true);
    })
    .catch(function (reject) {
      console.log("REJECTED");
    });

  return false;
}

function editComment(commentID, postID, profilePic, time) {

  // For displaying edit comment form


  // If edited comment form is not already opened
  if (!document.querySelector(`.edit-comment-form-${postID}`)) {


    var comment = document.querySelector(".comment-" + commentID);

    var commentSection = document.querySelector(`#comment-section-${postID}`);


    var user = comment.querySelector(".comment-user").innerHTML;
    user = user.slice(0, user.length - 3);
    var commentValue = comment.querySelector(".comment-text").innerHTML;
    var currentComment = comment.innerHTML;

    // Hiding comment form
    document.querySelector(`.comment-form-${postID}`).style.display = 'none';


    commentSection.innerHTML += `
    <div class='comment-form comment-form-${postID} edit-comment-form-${postID}'>
    <div class='user-image'>
              <img src='${profilePic}' class='post-avatar post-avatar-30' />
    </div>
      <form onsubmit ="return saveEditComment(${postID},${commentID},'${user}','${profilePic}','${time}')"  method="post" id='commentFormEdit_${commentID}'>
      <i class='tooltip-container fas fa-times comment-delete' onclick="javascript:showComment('${user}',${commentID},'${postID}','${profilePic}','${time}','${commentValue}',false)"><span class='tooltip tooltip-right'>Cancel</span></i>
          <input name = "comment_edit_${commentID}" type='text' autocomplete = "off" value = "${commentValue}" >
          
          <input style='display:none;' type="submit" id="${postID}" value="Comment" > 
      </form>
    </div>`;
  }
}

function showComment(user, commentID, postID, profilePic, time, comment, flag) {


  //Showing post comment form
  document.querySelector(`.comment-form-${postID}`).style.display = 'flex';
  document.querySelector(`.edit-comment-form-${postID}`).remove();

  if (flag)
    var edited = "Edited";
  else
    var edited = "";


  document.querySelector(`.comment-${commentID}`).innerHTML = `
  
                
    <div class='user-image'>
      <img src='${profilePic}' class='post-avatar post-avatar-30' />
    </div>
  
    <div class='comment-info'>
      <i class='tooltip-container far fa-trash-alt comment-delete' onclick='javascript:deleteComment(${commentID})'><span class='tooltip tooltip-right'>Remove</span></i>
      <i class="tooltip-container fas fa-edit comment-edit" onclick="javascript:editComment(${commentID},${postID},'${profilePic}','${time}')"><span class='tooltip tooltip-right'>Edit</span></i>
      <div class='comment-body'>
        <span class='comment-user'>${user} : </span>
        <span class='comment-text'>${comment}</span>
        <span class='comment-time'>${time}</span>
        <span class='comment-edit-text'>${edited}</span>   
      </div>
    </div>
  
  `;
}


//DP Animation Functions
function onClosedImagModal() {
  // When model is closed
  var modal = document.getElementById("modal");
  modal.classList.remove("modal-open");
  modal.classList.add("modal-close");

  // Timeout in displaying
  setTimeout(() => {
    modal.style.display = "none";
  }, 550);
}


function showImage() {
  // Showing pic in the model
  var modal = document.getElementById("modal");
  modal.classList.add("modal-open");
  modal.classList.remove("modal-close");
  modal.style.display = "block";
  document.getElementById("modal-img").src = document.getElementById(
    "profile_picture"
  ).src;
}

// function changePic() {
//   // Changing Pic xD
//   var formPic = document.querySelector(".formPic");
//   formPic.classList.toggle("show");
//   formPic.classList.toggle("hidden");
// }

function showEditImageButton(div) {
  document.querySelector(`.${div}`).classList.remove("hidden");
}

function hideEditImageButton(div) {
  document.querySelector(`.${div}`).classList.add("hidden");
}


//Search Function
function getUsers(value, flag) {

  // flag values :
  // 0 - Searching in messages
  // 1 - Normal Searching

  // Setting paramters for POST request
  var param = `query=${value}&flag=${flag}`;
  var searchFooter;

  ajaxCalls("POST", "search.php", param).then(function (result) {
    if (flag == 0)
      conflict = "-message";
    else
      conflict = "";

    if (result == "No") {
      // If no user found against search
      document.querySelector(".search-result" + conflict).style.display = "none";
    } else {
      // Displaying search results
      document.querySelector(".search-result" + conflict).style.display = "block";
      document.querySelector(".search-result" + conflict).innerHTML = result;

      if (value.length == 0) {
        document.querySelector(".search-result" + conflict).style.display = "none";
        searchFooter = "";
      } else {
        searchFooter = `<a class='see-more' href='allSearchResults.php?query=${value}'>See more</a>`;
        document.querySelector(".search-result").innerHTML += searchFooter;
      }
    }
  });
  // Pain in the ass
  return false;
}



function commentsRefresh() {

  if (window.location.pathname == '/socioConnect/main.php') {
    ajaxCalls("GET", "commentsAjax.php").then(function (result) {


      // Displaying search results
      var data = JSON.parse(result);

      timeToShow = 'Just Now';

      for (i = 0; i < data.length; i++) {
        var obj = data[i];

        var comment = `
      <div class='comment comment-${obj.commentID}'>
                    
      <div class='user-image'>
          <a href='timeline.php?visitingUserID=${obj.commentUserID}'><img src='${obj.profilePic}' class='post-avatar post-avatar-30' /></a>
      </div>
      
      <div class='comment-info'>
      
      <div class='comment-body'>
      <a href='timeline.php?visitingUserID=${obj.commentUserID}' class='comment-user'>${obj.name} : </a>
      <span class='comment-text'>${obj.comment}</span>
      <span class='comment-time'>${timeToShow}</span>
      </div>
      </div>
  </div>
         `;

         

        if(document.querySelector(`.comment-area-${obj.postID}`)){
        document.querySelector(`.comment-area-${obj.postID}`).innerHTML += comment;
        }
      }
    });
  }
}



function notificationRefresh() {
  ajaxCalls("GET", "notificationsAjax.php").then(function (result) {
    // Displaying search results
    var data = JSON.parse(result);

    var notification = "";
    var notiLink = "";
    var conflict = "";
    var notiIcon = "";


    for (i = 0; i < data.length; i++) {
      var obj = data[i];


      if (obj.type == 'commented') {

        notiIcon = 'far fa-comment-dots';
        conflict = "commented on your post";

      } else if (obj.type == 'liked') {

        notiIcon = 'far fa-thumbs-up';
        conflict = "liked your post";

      } else if (obj.type == 'post') {

        notiIcon = 'far fa-user';
        conflict = "posted";

      } else if (obj.type == 'request') {
        conflict = 'sent you a request';
        notiIcon = 'fas fa-user-plus';
        notiLink = "requests.php?notiID=$notiID";
      }

      if (obj.type != 'request') {
        notiLink = `
       notification.php?postID=${obj.postID}&type=${obj.type}&notiID=${obj.notiID} `;

      }


      var notification =
        `<a href=${notiLink} class='notification noSeen'>
          
                <span class='notification-image'>
                <img src='${obj.profilePic}' class='post-avatar post-avatar-30' />
                </span>
                <span class='notification-info'>
            <span class='notification-text'>${obj.name} has ${conflict}</span><i class='noti-icon ${notiIcon}'></i><span class='noti-time'>Now</span></span></a>
`;
      // Dropdown
      document.querySelector(`.notifications-dropdown`).innerHTML =
        notification + document.querySelector(`.notifications-dropdown`).innerHTML;

        if(document.querySelector('.notifications')){
        document.querySelector(`.notifications`).innerHTML =
        notification + document.querySelector(`.notifications`).innerHTML;
        }
    }
  });
}



function likesRefresh() {
  if (window.location.pathname == '/socioConnect/main.php') {
    ajaxCalls("GET", "likesAjax.php").then(function (result) {
      // Displaying search results
      var data = JSON.parse(result);

      for (i = 0; i < data.length; i++) {
        var obj = data[i];

        if(document.querySelector(`.like-count-${obj.postID}`)){
        document.querySelector(`.like-count-${obj.postID}`).innerHTML = obj.likes;
        }
      }
    });
  }
}

function likeUsers(postID) {
  ajaxCalls("GET", `likeUsers.php?postID=${postID}`).then(function (result) {
    // Displaying search results
    document.querySelector(`.like-count-${postID} .count`).innerHTML = "";
    var data = JSON.parse(result);
    let flag = true;

    for (i = 0; i < data.length; i++) {
      flag = false;
      var obj = data[i];
      console.log("In");
      document.querySelector(`.like-count-${postID} .count`).innerHTML += `${
        obj.name
        }<br>`;
    }
    if (flag) {
      document
        .querySelector(`.like-count-${postID} .count`)
        .classList.remove("tooltip");
    }
  });
}

function hideLikers(postID) {
  // Hiding likers when clicked on number again
  document.querySelector(`.like-count-${postID} .count`).innerHTML = "";
}

function message() {
  let messageBody = document.messageForm.message_body;
  let partner = document.messageForm.partner;
  let pic = document.messageForm.pic;

  var width = document.querySelector(".chat-messages").offsetWidth;
  var widthX = document.querySelector(".chat-messages .message");

  console.log("width : " + width * 0.8);
  console.log(messageBody.value.length);
  if (messageBody.value.length > 0) {
    let param = `partner=${partner.value}&messageBody=${messageBody.value}`;

    document.querySelector(".chat-messages").innerHTML += `
      <div class="chat-message my-message">
        <img src='${pic.value}' class='post-avatar post-avatar-30' />
        <span class='message'>${messageBody.value}</span>
        <span class='message-time'>Just now</span>
      </div>
      `;

    ajaxCalls("POST", "messageAjax.php", param).then(function (response) {
      console.log("Response messageSimple : " + response);
      var msgs = document.querySelectorAll(".chat-message");
      if (
        document.getElementById("loading-messages").innerHTML ==
        "No Messages To Show"
      )
        document.getElementById("loading-messages").innerHTML =
          "No More Messages To Show";
    });

    messageBody.value = "";

    var last = document.querySelector(".my-message:last-child");
    // var last = nodes[nodes.length - 1];

    last.scrollIntoView();
  }
}

setInterval(messageRefresh, 1000);

function messageRefresh() {
  var url = window.location.href;
  var id = url.substring(url.lastIndexOf("=") + 1);

  ajaxCalls("GET", `messageAjax.php?id=${id}`).then(function (response) {
    let messageResponse = JSON.parse(response);

    for (i = 0; i < messageResponse.length; i++) {
      let obj = messageResponse[i];

      document.querySelector(".chat-messages").innerHTML += `
      <div class='chat-message their-message'>
            <img src='${obj.pic}' class='post-avatar post-avatar-30' />
            <span class='message'>${obj.message}</span>
            <span class='message-time'>Just now</span>
        </div>
       `;

      var last = document.querySelector(".their-message:last-child");
      // var last = nodes[nodes.length - 1];

      last.scrollIntoView();
    }
  });
}

function refreshRecentConvos() {
  ajaxCalls("GET", "recentConvoAjax.php").then(function (result) {
    var data = JSON.parse(result);

    if (!(data.notEmpty == "Bilal")) {
      // console.log(data);
      for (i = data.length - 1; i >= 0; i--) {
        var obj = data[i];
        if (document.querySelector(".recent-chats .recent-user-" + obj.fromID)) {
          document.querySelector(".recent-chats").removeChild(document.querySelector(".recent-chats .recent-user-" + obj.fromID));
        }
        var recentMessage = `
        <div class='recent-user-div recent-user-${obj.fromID}'>
          <a href='messages.php?id=${
          obj.fromID
          }' class='recent-user'>
            <span class='recent-user-image'>
              <img src='${obj.pic}' class='post-avatar post-avatar-40' />
            </span>
            <span class='recent-message-info'>
              <span class="recent-username">${obj.partner}</span>
              <span class='recent-message-text'>${obj.from} ${obj.msg}</span>
              <span class='recent-message-time'>${obj.at}</span>
            </span>
          </a>

          <span class='chat-del-button'  style="float: right">
            <i class='tooltip-container far fa-trash-alt  comment-delete' onclick='javascript:deleteConvo(${obj.fromID})'><span class='tooltip tooltip-left'>Delete</span></i>
          </span>
        </div>
        `;
        if (document.querySelector(".recent-chats")) {
          document.querySelector(".recent-chats").innerHTML =
            recentMessage + document.querySelector(".recent-chats").innerHTML;
        }
      }
    }
  });
}
setInterval(refreshRecentConvos, 1000);

function deleteConvo(id) {
  // For deleting User Chat
  // id - loggedIn userID

  var url = window.location.href; // URL of the current window
  var openConvoId = url.slice(46); // Will give the ID of the user whom you are chatting with
  let param = `id=${id}&urlID=${openConvoId}`;
  ajaxCalls("POST", `deleteConvoAjax.php`, param).then(function (response) {
    console.log(response);
    //If response is not a redirection, this would be changed if this comment is removed from messags.php
    if (response == "Reload the page") {
      window.location.href = "messages.php"; // Redirect the user to message Page
    } else {
      document.querySelector(".recent-chats").innerHTML = response;
    }
  });
}

function showPageMessages(id, page) {
  document.getElementById("loading-messages").style.display = "none";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "loadMessagesAjax.php?id=" + id + "&page=" + page, true);
  xhr.onload = function () {
    if ((this.status = 200)) {
      document.querySelector(".chat-messages").innerHTML =
        this.responseText + document.querySelector(".chat-messages").innerHTML;
      document.getElementById("loading-messages").style.display = "block";
    }
    if (document.getElementById("noMoreMessages").value == "true")
      document.getElementById("loading-messages").innerHTML =
        "No More Messages To Show";
  };
  xhr.send();
}

function showNextPageMessages(id) {
  var noMorePosts = document.getElementById("noMoreMessages");
  var page = document.getElementById("nextPageMessages");
  if (noMorePosts.value == "false") {
    //deleting previous data
    var div = document.querySelector(".chat-messages");
    div.removeChild(page);
    div.removeChild(noMorePosts);

    showPageMessages(id, page.value);
  } else {
    alert("khtm");
  }
}

function removeFriend(id) {
  var path = window.location.pathname;
  var args = window.location.search;
  var flag = "";
  if (path != "/socioConnect/requests.php") {
    var flag = " limit 10";
  }
  var redirectionFlag = true;

  //if you are on someone else's friends page, then don't resfresh the page, just change the icon
  if(args)
    var redirectionFlag = false;
    
  let param = `friendId=${id}&conflict=${flag}`;
  ajaxCalls("POST", "removeFriendAjax.php", param).then(function (result) {
    if(redirectionFlag){
      var data = JSON.parse(result);
      // if(data.length == 0){
      //   document.querySelector(".friends-list-elements").innerHTML = "";
      // }
      // else{
      console.log("Response messageSimple : " + data[0]);
      document.querySelector(".friends-container").innerHTML = "";
      flag = 0;
      console.log(data.length);
      for (i = 0; i < data.length; i++) {
        flag++;
        var obj = data[i];
        var friend = `
          <div class="friend-container">
            <div class='friend'>
              <div class='friend-image'>
                <img class='post-avatar post-avatar-30' src='${
          obj.profile_pic
          }'  >
              </div>
              <div class='friend-info'>
                <a href="timeline.php?visitingUserID=${
          obj.user_id
          }" class='friend-text'>${obj.name}</a>   
                <span class='${obj.state}'>${obj.time}</span>         
              </div>
              <div class='friend-action'>
              <div>
                <a href="javascript:removeFriend(${
          obj.user_id
          })" class='remove-friend'><i class="fas fa-times tooltip-container"><span class='tooltip tooltip-right'>Remove Friend</span></i></a>
                </div>
              </div>
            </div> 
            </div>  
          `;
        document.querySelector(".friends-container").innerHTML += friend;
        if (flag == 10 && path != "/socioConnect/requests.php")
          break;
      }
      if (path != "/socioConnect/requests.php") {
        if (flag == 0) {
          document.querySelector(".show-more-friends").innerHTML =
            "<p class='see-more'>No Friends To Show</p>";
        } else if (flag == 10) {
          document.querySelector(".show-more-friends").innerHTML =
            "<a href='requests.php' class='see-more'><span>See more</span></a>";
        } else {
          document.querySelector(".show-more-friends").innerHTML =
            "<p class='see-more'>No More Friends To Show</p>";
        }
      }
    }
    else{
      var personLink = document.querySelector(`.remove-friend-${id}`);  
      personLink.className = `add-friend add-friend-${id}`;
      personLink.setAttribute("href",`javascript:addFriend(${id})`);
      personLink.querySelector(".tooltip").innerHTML = "Add Friend";

      fontAwesomeIcon = personLink.querySelector(".tooltip-container");
      fontAwesomeIcon.classList.remove("fa-times");
      fontAwesomeIcon.classList.add("fa-plus");   
      
    }
  });
}

function addFriend(id){
  var personLink = document.querySelectorAll(`.add-friend-${id}`);
  var fontAwesomeIcon;
  for(var i=0; i<personLink.length; i++){
    fontAwesomeIcon = personLink[i].querySelector(".tooltip-container");
    fontAwesomeIcon.classList.remove("fa-plus");
    fontAwesomeIcon.classList.add("fa-check");
  }
  
  let param = `id=${id}`;
  ajaxCalls('POST', 'addFriendAjax.php', param).then(function (result) {

    for(var i=0; i<personLink.length; i++){
      personLink[i].setAttribute("href",`javascript:cancelReq(${id})`);
      personLink[i].querySelector(".tooltip").innerHTML = "Friend Request Sent";
    }
  });

}

function cancelReq(id){
  var personLink = document.querySelectorAll(`.add-friend-${id}`);
  var fontAwesomeIcon;
  for(var i=0; i<personLink.length; i++){
    fontAwesomeIcon = personLink[i].querySelector(".tooltip-container");
    fontAwesomeIcon.classList.remove("fa-check");
    fontAwesomeIcon.classList.add("fa-plus");
  }
  let param = `id=${id}`;
  ajaxCalls('POST', 'cancelReqAjax.php', param).then(function (result) {
    for(var i=0; i<personLink.length; i++){
      personLink[i].setAttribute("href",`javascript:addFriend(${id})`);
      personLink[i].querySelector(".tooltip").innerHTML = "Add Friend";
    }
  });
  
}

function showPage(flag, page) {
  document.getElementById("loading").style.display = "none";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", `loadPostsAjax.php?flag=${flag}&page=${page}`, true);
  xhr.onload = function () {
    if ((this.status = 200)) {
      document.querySelector(".posts").innerHTML += this.responseText;
      document.getElementById("loading").style.display = "block";
    }
    if (document.getElementById("noMorePosts").value == "true")
      document.getElementById("loading").innerHTML = "No More Posts To Show";
  };
  xhr.send();
}

function showFirstPage(flag) {
  showPage(flag, 1);
}

function showNextPageCaller(flag) {
  //if user has scrolled to the bottom of the page
  if (true)
    setTimeout(function () {
      showNextPage(flag);
    }, 2000);
}

function showNextPage(flag) {
  //Fetching page no and flag to find whether more post are availible or not
  var noMorePosts = document.getElementById("noMorePosts");
  var page = document.getElementById("nextPage");
  if (noMorePosts.value == "false") {
    //deleting previous data
    var div = document.querySelector(".posts");
    div.removeChild(page);
    div.removeChild(noMorePosts);

    showPage(flag, page.value);
  }
}

function hello() {
  alert("hello");
}

function showPageNotis(page) {
  document.getElementById("loading-notis").style.display = "none";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "loadNotificationsAjax.php?page=" + page, true);
  xhr.onload = function () {
    if ((this.status = 200)) {
      document.querySelector(".notifications").innerHTML =
        document.querySelector(".notifications").innerHTML + this.responseText;
      document.getElementById("loading-notis").style.display = "block";
    }
    if (document.getElementById("noMoreNotis").value == "true")
      document.getElementById("loading-notis").innerHTML =
        "No More Notifications To Show";
  };
  xhr.send();
}

function showNextPageNotis() {
  var noMorePosts = document.getElementById("noMoreNotis");
  var page = document.getElementById("nextPageNotis");
  if (noMorePosts.value == "false") {
    //deleting previous data
    var div = document.querySelector(".notifications");
    div.removeChild(page);
    div.removeChild(noMorePosts);
    showPageNotis(page.value);
  } else {
    alert("khtm");
  }
}

function showPageActivities(page) {
  var args = window.location.search;
  var id = args.slice(args.search("=") + 1);
  var param;
  if(id  == "")
    param = "page=" + page;
  else
    param = "page="+page+"&id="+id 
  document.getElementById("loading-activities").style.display = "none";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "loadRecentActivitiesAjax.php?"+param, true);
  xhr.onload = function () {
    if ((this.status = 200)) {
      document.querySelector(".activities").innerHTML =
        document.querySelector(".activities").innerHTML + this.responseText;
      document.getElementById("loading-activities").style.display = "block";
    }
    if (document.getElementById("noMoreActivities").value == "true")
      document.getElementById("loading-activities").innerHTML =
        "No More Activities To Show";
  };
  xhr.send();
}

function showNextPageActivities() {
  var noMorePosts = document.getElementById("noMoreActivities");
  var page = document.getElementById("nextPageActivities");
  if (noMorePosts.value == "false") {
    //deleting previous data
    var div = document.querySelector(".activities");
    div.removeChild(page);
    div.removeChild(noMorePosts);
    showPageActivities(page.value);
  } else {
    alert("khtm");
  }
}

// Function for controlling dropdowns
function toggleDropdown(type) {
  // type:
  // Notification,Message,Request

  // Getting the Dropdown
  let display = document.querySelector(type).style.display;

  if (display == "block") {
    document.querySelector(type).style.display = "none";
  } else {
    document.querySelector(type).style.display = "block";
  }
}

/*  --------------- Closing Dropdowns when other areas are clicked ------------------ */
window.onclick = function (e) {
  if (e.srcElement.className != "search-input") {
    document.querySelector(".search-result").style.display = "none";
  }

  if (document.querySelector('.search-result-message') && e.srcElement.className != "search-result-message") {

    document.querySelector(".search-result-message").style.display = "none";

  }



  // Will loop through the array of dropdowns
  let arr = ["noti", "msg", "req"];
  arr.forEach(function (value) {
    if (
      !e.srcElement.classList.contains(`${value}-click`) &&
      !e.srcElement.classList.contains(`${value}-dropdown`)
    ) {
      console.log('Here');
      document.querySelector(`.${value}-dropdown`).style.display = "none";
    }
  });
};

/* ------------------------------------------------------------------------------ */


function editCoverPicture() {
  console.log('here');

  var coverPicData = document.querySelector("input[name='cover-pic']");

  var coverPic = coverPicData.files[0];

  console.log(coverPic);

  var formData = new FormData();
  formData.append("cover_pic", coverPic);


  ajaxCalls('POST', 'uploadpic.php', formData, 'pic').then(function (result) {
    console.log(result);
    document.querySelector('.user-cover').style.backgroundImage = `url(${result})`;

  });

}


function editProfilePicture() {
  console.log('Proifle');

  var ProfilePicData = document.querySelector("input[name='profile-pic']");

  var ProfilePic = ProfilePicData.files[0];

  console.log(ProfilePic);

  var formData = new FormData();
  formData.append("profile_pic", ProfilePic);


  ajaxCalls('POST', 'uploadpic.php', formData, 'pic').then(function (result) {
    console.log(result);
    document.querySelector('#profile_picture').src = result;

  });
}


setInterval(commentsRefresh, 3000);
setInterval(notificationRefresh, 3000);
setInterval(likesRefresh, 3000);


//DP Animation Functions
function hideEditInfoDiv() {
  // When model is closed
  var editDiv = document.querySelector(".user-info-edit-div");
  editDiv.classList.remove("modal-open");
  editDiv.classList.add("modal-close");

  // Timeout in displaying
  setTimeout(() => {
    editDiv.style.display = "none";
  }, 550);
}
function showEditInfoDiv(){
  // Showing pic in the model
  var editDiv = document.querySelector(".user-info-edit-div");
  editDiv.classList.add("modal-open");
  editDiv.classList.remove("modal-close");
  editDiv.style.display = "block";

  //Getting current info
  var skul = document.querySelector(".user-school").innerHTML;
  var colg = document.querySelector(".user-college").innerHTML;
  var uni = document.querySelector(".user-university").innerHTML;
  var work = document.querySelector(".user-work").innerHTML;
  var cntct = document.querySelector(".user-contact").innerHTML;
  var actualAge =  document.querySelector(".actualAge").value;
  var gender = document.querySelector(".user-gender").innerHTML; 
 
  //Setting Values in input fields
  var defaultVaue = "-------";
  if(skul.trim() == defaultVaue)
    skul = "";
  if(colg.trim() == defaultVaue)
    colg = "";
  if(uni.trim() == defaultVaue)
    uni = "";
  if(work.trim() == defaultVaue)
    work = "";  
  if(cntct.trim() == defaultVaue)
    cntct = "";  

  document.querySelector(".user-edit-school").value =  skul;
  document.querySelector(".user-edit-college").value = colg;
  document.querySelector(".user-edit-university").value = uni;
  document.querySelector(".user-edit-work").value = work;
  document.querySelector(".user-edit-contact").value =cntct;
  document.querySelector(".user-edit-age").value = actualAge;  
  document.querySelector(".user-edit-gender").value = gender.trim(); 
}

function submitEditInfoForm(){
  //Setting Values in input fields
  var oldPass = document.querySelector(".user-edit-old-password").value;
  var newPass = document.querySelector(".user-edit-new-password").value;
  var rePass = document.querySelector(".user-edit-new-repeat-password").value;
  var skul = document.querySelector(".user-edit-school").value;
  var colg = document.querySelector(".user-edit-college").value;
  var uni = document.querySelector(".user-edit-university").value;
  var work = document.querySelector(".user-edit-work").value;
  var cntct = document.querySelector(".user-edit-contact").value;
  var age = document.querySelector(".user-edit-age").value;
  var genderDropDow = document.querySelector(".user-edit-gender");
  var gender = genderDropDow.options[genderDropDow.selectedIndex].value;
  //var gender = document.querySelector(".");
 //Password Validation
  var errorMessage = "";
  var error = [];
  var flag1 = flag2 = false;

  if(newPass){
    if(newPass != rePass){
        error.push("s Don't Match");
        flag1 = true;
    }
    else{
      if(newPass.length < 8){
        flag1 = true;
        error.push("'s length must be greater than 8 characters");
      }
      if(!(/\d/.test(newPass) && newPass.match(/[a-z]/i))){
        flag2 = true;
        error.push(" must contain alphanumeric characters")
      }  
    }
  }
  else if(oldPass){
    //Do nothin, just to make an exception from else 
  }
  else{
    error.push(" field can't be empty");
    flag1 = true;
  }  
  if(flag1 && flag2)
    errorMessage = "Password" + error[0] + " and" + error[1];
  else if(flag1 || flag2)
    errorMessage = "Password" + error[0];
  if(flag1 || flag2){
    alert(errorMessage);
    document.querySelector(".user-edit-old-password").value = "";
    document.querySelector(".user-edit-new-repeat-password").value = "";
    document.querySelector(".user-edit-new-password").value = "";
  }
  else{
    document.getElementById("editForm").submit();
  }
}
