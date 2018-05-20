<?php
require('db.php');
session_start();


function set_message($msg)
{
    if (!empty($msg)) {
        $_SESSION['message'] = $msg;
    } else {
        $msg = "";
    }
}

function display_message()
{
    if (isset($_SESSION['message'])) {
        echo $_SESSION['message'];
        unset($_SESSION['message']);
    }
}

function queryFunc($query)
{
    global $connection;
    $queryResult = mysqli_query($connection, $query);

    if (!$queryResult) {
        die('Error in querying database '.mysqli_error($connection));
    }
    return $queryResult;
}

function isData($queryResult)
{
    return (mysqli_num_rows($queryResult) != 0);
}


//faster
function isRecord($queryResult)
{
    return  (mysqli_fetch_assoc($queryResult));
}


//Slower
function fetch_array($result)
{
    return mysqli_fetch_array($result);
}

//Not working
function escape_string($string)
{
    global $connection;
    return mysqli_real_escape_string($connection, $string);
}

function hashString($string)
{
    $hash = '$2y$10$';
    $salt = 'thisisthestringusedfor';

    $hashed = $hash.$salt;

    $string = crypt($string, $hashed);

    return $string;
}

function redirection($path)
{
    header('Location: '.$path);
}

function add_post()
{
    $addPost = <<<DELIMETER
         <div id='addPost'>
            <h2>Add a post</h2>
            <form action="post.php" method='POST'>
                <textarea name="post" id="" cols="50" rows="10" placeholder='Start Writing'></textarea><br><br>
                <input type="file"><br><br>
                <a class='postBtn' href="javascript:addPost({$_SESSION['user_id']})" >Post</a>
            </form>
        </div>
DELIMETER;
    echo $addPost;
}

function new_post($postContent){
    global $connection;

    $post = mysqli_real_escape_string($connection,$postContent);
    $user_id = $_SESSION['user_id'];

    $queryResult =  queryFunc("INSERT INTO posts(post,user_id,createdAt) VALUES('$post','$user_id',now())");

    show_posts(4);


}


function deletePost($postID){
    $deleteQuery = queryFunc("DELETE from posts WHERE post_id ='$postID'");
    $deletePostComments = queryFunc("DELETE from comments WHERE post_id ='$postID'");
    $deletePostLikes = queryFunc("DELETE from likes WHERE post_id ='$postID'");
    return $deleteQuery;
}

function deleteComment($commentID)
{
    $deleteQuery = queryFunc("DELETE from comments WHERE comment_id ='$commentID'");
    return $deleteQuery;
}

function addComment($userID, $postID, $comment)
{
    global $connection;
    $stmt = $connection->prepare("INSERT INTO comments (user_id, post_id, comment,createdAt) VALUES (?, ?, ?,now())");
    $stmt->bind_param("iis", $userID, $postID, $comment);
    $stmt->execute();
    $stmt->close();

    //Generating Notification
    $whosePostQuery = queryFunc("SELECT user_id from posts where post_id='$postID'");
    $whosePost = isRecord($whosePostQuery);
    notification($userID,$whosePost['user_id'],$postID,'commented');
    
    $queryResult = queryFunc("SELECT comment_id from comments ORDER BY comment_id DESC LIMIT 1");
    $row = isRecord($queryResult);

    return $row['comment_id'];
}

function show_posts($flag)
{
    //Selecting all the posts in a manner where user_id matches post_id
    // if flag is true then it is newsfeed else it is your timeline xD
    if ($flag==1) {
        $queryResult = queryFunc("SELECT post,post_id,posts.user_id,CONCAT(first_name,' ',last_name) as 'name',createdAt from posts inner join users on users.user_id = posts.user_id order by post_id desc");
    } else if($flag == 2) {
        $queryResult = queryFunc("SELECT post,post_id,posts.user_id,CONCAT(first_name,' ',last_name) as 'name',createdAt from posts inner join users on users.user_id = posts.user_id where users.user_id = {$_SESSION['user_id']} order by post_id desc");
    }
    else if($flag==3){
        $postID = $_SESSION['notiPostID'];
        $queryResult = queryFunc("SELECT post,post_id,posts.user_id,CONCAT(first_name,' ',last_name) as 'name',createdAt from posts inner join users on users.user_id = posts.user_id WHERE post_id='$postID'");
        
    }
    else if($flag == 4){
        $userID = $_SESSION["user_id"];
        $queryResult = queryFunc("SELECT post,post_id,posts.user_id,CONCAT(first_name,' ',last_name) as 'name',createdAt from posts inner join users on users.user_id = posts.user_id WHERE posts.user_id='$userID' order by post_id desc LIMIT 1");
    }

    if (isData($queryResult)) {
        while ($row = isRecord($queryResult)) {
            $postID = $row['post_id'];
            $diffTime = find_difference_of_time($row['createdAt']);
            $timeToShow = create_time_string($diffTime);
            
            //Getting likes count for the current post
            $likesResult = queryFunc("SELECT count(*) as count from likes where post_id='$postID'");
            $likes = isRecord($likesResult);

            if ($row['user_id'] == $_SESSION['user_id']) {
                $PostDeleteButton = <<<PosDel
                <a  class='deleteBtn' href="javascript:deletePost({$postID})" >Delete</a>
PosDel;
            } else {
                $PostDeleteButton = '';
            }
            
            $post = <<<POST
            <div class='post post_{$postID}'>
                <span class='user'>{$row['name']}</span>
                <span class='postTime'>$timeToShow</span>
                <p class='postContent'>{$row['post']}</p>
                <span class='likeCount likeCount-{$postID}'>{$likes['count']}</span>
                <a class='likeBtn' href='javascript:like({$postID})'>Like</a>
                <a  class='commentBtn' href="javascript:showCommentField({$postID})">Comment</a>
                {$PostDeleteButton}
            
POST;
            //opening comment section if is a notification
            if($flag == 3 && $_SESSION['notiType'] != 'liked'){
                $commentShow = 'show';
            }else{
                $commentShow = 'hidden';
            }

            $post .= <<<POST
            <div id="post_id_{$postID}" class='{$commentShow}'>
                <div class='commentArea_{$postID}'>

POST;


            $commentResult = queryFunc("SELECT comments.user_id,comment_id,comment,CONCAT(first_name,' ',last_name) as 'name',createdAt from comments inner join users on users.user_id = comments.user_id where comments.post_id ='$postID' order by createdAt");

            while ($comments = isRecord($commentResult)) {
                $diffTime = find_difference_of_time($comments['createdAt']);
                $timeToShow = create_time_string($diffTime);
                $commentID = $comments['comment_id'];

                if ($comments['user_id'] == $_SESSION['user_id']) {
                    $commentDeleteButton = <<<ComDel
                    <a class='commentDelete' href='javascript:deleteComment({$commentID})'>X</a>
ComDel;
                } else {
                    $commentDeleteButton = '';
                }
                
                $post .= <<<POST
                <div class='comment comment_{$commentID}'>
                    {$commentDeleteButton}
                    <span class='commentUser'>{$comments['name']} : </span>
                    <span class='commentText'>{$comments['comment']}</span>
                    <span class='commentTime'>$timeToShow</span>
                </div>
            
POST;
            }
            $post .= <<<POST
            </div>
            <div class='commentForm'>
                <form onsubmit="return comment({$postID})" method="post" id='commentForm'>
                    <input name = "comment_{$postID}" type='text'>
                    <input type="text" value="{$postID}" style="display:none" name="post_id_{$postID}">
                    <input type="text" value="{$_SESSION['user']}" style="display:none" name="post_user">
                    <input type='submit' id="{$postID}" value="Comment"> 
                </form>
            </div>
       
    </div>
   </div>
   <br>
POST;
            echo $post;
        }
    }
}


function logout()
{
    session_start();
    session_destroy();
    redirection('index.php');
}

function find_difference_of_time($createdAt)
{
    $currentTime = queryFunc("SELECT TIMESTAMPDIFF(SECOND, '".$createdAt."', now()) as 'time' ");
    $currentTime = isRecord($currentTime);
    return $currentTime['time'];
}

function create_time_string($timeDate)
{

    // Time in seconds
    if ($timeDate < 60) {
        // if it is just one second
        if ($timeDate == 1) {
            return $timeDate ." Second Ago";
        } else {
            return $timeDate ." Seconds Ago";
        }
    }
    // Time in minutes
    elseif ($timeDate > 59 && $timeDate < 3600) {
        // if it is just one minute
        if (($timeDate / 60) < 2) {
            return floor($timeDate / 60) . " Minute Ago";
        } else {
            return floor($timeDate / 60) . " Minutes Ago";
        }
    }
    // Time in hours
    elseif ($timeDate > 3599 && $timeDate < 86400) {
        // Shouldn't it be 3600?
        // if it is just one hour
        if (($timeDate / 3600) < 2) {
            return floor($timeDate / 3600) . " Hour Ago";
        } else {
            return floor($timeDate / 3600) . " Hours Ago";
        }
    }
    // Time in days
    elseif ($timeDate > 86399) {
        // if it is just one day
        if (($timeDate / 86400) < 2) {
            return floor($timeDate / 86400) . " Day Ago";
        } else {
            return floor($timeDate / 86400) . " Days Ago";
        }
    }
}

function validate_form($email, $pass, $re_pass)
{
    $queryResult = queryFunc("SELECT user_id from users where email='$email'");
    $row = isRecord($queryResult);

    if ($pass != $re_pass || $row['user_id'] > 0 || preg_match("/[0-9]+/", $pass) == 0 || preg_match("/[A-Za-z]+/", $pass) == 0) {
        if ($row['user_id'] > 0) {
            $_SESSION['s_email_error'] = "Email Already in Use";
        } else {
            $_SESSION['s_email_error'] = "";
        }
        if ($pass != $re_pass) {
            $_SESSION['s_pass_error'] = "Passwords Don't Match";
        } elseif (preg_match("/[0-9]+/", $pass) == 0 ||  preg_match("/[A-Za-z]+/", $pass) == 0) {
            $_SESSION['s_pass_error'] = "Password Must Contain Alphanumeric Characters";
        } else {
            $_SESSION['s_pass_error'] = "";
        }
        return false;
    } else {
        return true;
    }
}


function show_personal_info()
{
    $queryResult = queryFunc("SELECT * from users where user_id={$_SESSION['user_id']}");
    $row = isRecord($queryResult);
    $pic = $row['profile_pic'];
    if (isset($pic)) {
        $picForm = 'hidden';
    } else {
        $picForm = 'show';
    }

    $info = <<<DELIMETER
    <div id="modal" class="modal">
        <span class="close" id="modal-close" onclick="onClosedImagModal()">&times;</span>
        <img class="modal-content" id="modal-img" src='http://localhost/SocioConnect/{$pic}'>
    </div>
     <img class='dp' src='http://localhost/SocioConnect/{$pic}'alt='hello' onclick='showImage()'>
     <button onclick="javascript:changePic()">Change Profile Pic</button>
     <p>First Name: {$row['first_name']} </p>
     <p>Last Name: {$row['last_name']}</p>
     <p>Email: {$row['email']}</p>
     <p>Age: {$row['age']}</p>
     <p>Gender: {$row['gender']}</p>
DELIMETER;

    $info .= <<<DELIMETER
     <form action="uploadpic.php" method="post" enctype="multipart/form-data" class='formPic {$picForm}'>
        <label for='file'>Select a pic</label>
        <input type="file" name="file" style='margin-left:110px;'><br>
        <input type="submit" name="submit" value="Upload Photo">
     </form>
DELIMETER;

    echo $info;

    if (isset($_SESSION['dp_upload_message'])) {
        echo $_SESSION['dp_upload_message'];
        unset($_SESSION['dp_upload_message']);
    }
}

function notification($s_user, $d_user, $post, $type)
{

    $notiAlready = queryFunc("SELECT noti_id from notifications WHERE s_user_id='$s_user' AND  d_user_id='$d_user' AND post_id='$post' AND typeC='$type'");

    if (isData($notiAlready)) {
    } else {
        $notiQuery = queryFunc("INSERT INTO notifications(s_user_id,d_user_id,post_id,typeC) VALUES('$s_user', '$d_user','$post','$type')");
    }
}

function show_notifications(){
    $user = $_SESSION['user_id'];

    $notiQuery = queryFunc("SELECT * from notifications WHERE d_user_id='$user'");

    $isAny = false;

    if(isData($notiQuery)){
        while($row = isRecord($notiQuery)){
            if($user != $row['s_user_id']){
                $isAny = true;
                $person = $row['s_user_id'];
                $post = $row['post_id'];
                $type = $row['typeC'];

            $personQuery = queryFunc("SELECT CONCAT(first_name,' ',last_name) as name FROM users WHERE user_id='$person'");
            $sPerson = isRecord($personQuery);
    
                $noti = <<<NOTI
                <a href='notification.php?postID={$post}&type={$type}'>{$sPerson['name']} has {$type} your post</a>
NOTI;
            echo $noti;
            }
        }

        if($isAny){
            queryFunc("DELETE from notifications WHERE d_user_id='$user'");
        }else{
            echo '<p>No new notifications</p>';
        }

     
    }else{
        echo '<p>No new notifications</p>';
    }

    
}



?>
