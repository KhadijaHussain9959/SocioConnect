<?php 

  include('header.php');

  if(!isset($_SESSION['user_id'])){
    redirection('index.php');
  }

  // Main file of the website
  $_SESSION['no_of_posts_changed'] = 0;
  $_SESSION['last_msg_id'] = 0;
  $_SESSION['last_message_retrieved_for_recent_convos'] = 0;
  // Getting current user name
?>

<!-- Notification Area of the page -->

<div class="content-area">
      <!-- <div class="notification-area">
        <div class='notifications'>
          <div class='notification-heading'>Notifications</div>
          <?php //showNotifications(10);?>
          <a href='allNotification.php' class='see-more'>
        <span>See more</span>
      </a>
        </div>
      </div> -->


      <div class="notification-area">
        <div class='notifications' id="recent_activities">
          <div class='notification-heading'>Recent Activities</div>
          <div class='activities-content'>
          <?php showRecentActivities(1,10,'all');
          ?>
          </div>
          <a href='allActivities.php' class='see-more'>
        <span>See more</span>
      </a>
        </div>
      </div>

<div class='post-area'>
  <div class='new-post'>
<?php 
// Add post functionality
addPost(true,"");

?>
</div>

<div class='posts'>
  
<?php
  showPosts('a',1,10);
?>
</div>
<div id='loading' class='loading-messages'></div>
</div>

<div class="friends-area">
    <div class='friend-heading'>Friends</div>
      <?php displayFriends(10); ?>
      <a href='requests.php' class='see-more'>
        <span><?php if($_SESSION['more_friends'] == 1) 
                      echo "See more";
              ?></span>
      </a>
      <?php if($_SESSION['more_friends'] == 0) 
                echo "No Friends to Show";
      ?>
</div>

</body>
</html>
<script src="script.js" ></script>

<script>
// window.addEventListener('scroll',function(){
//   showNextPageCaller('a')
// });
</script>





