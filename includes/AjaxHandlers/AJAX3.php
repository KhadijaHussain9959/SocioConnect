<?php
require_once dirname(__FILE__, 2) . '/functions.php';

if (!isset($_SESSION['user_id'])) {
    redirection('../../index.php');
}

if (isset($_GET['notiPage'])) {

    $limit = 10;
    showNotifications(3, $_GET['page'], $limit);

} elseif (isset($_GET['messagePage'])) {

    $limitMsg = 10;
    showMessages($_GET['id'], $_GET['page'], $limitMsg);

} elseif (isset($_GET['like'])) {

    // We need to add a new column to likes table, that would store the user_id of the person whose post in being liked.

// For adding like to the current post
    if (isset($_GET['like'])) {
        $postID = mysqli_real_escape_string($connection, $_GET['like']); // Post ID
        $userID = $_SESSION['user_id']; // user who liked the post

        //Checking if the post is already been liked.
        $checkLikeResult = queryFunc("SELECT * from likes where post_id ='$postID' AND user_id ='$userID'");

        //if it is already been liked,then unlike it
        if (isData($checkLikeResult)) {
            $unlikeResult = queryFunc("DELETE from likes where post_id='$postID' AND user_id ='$userID'");
        } else {
            //else like it
            $likeResult = queryFunc("INSERT INTO likes (post_id,user_id,createdAt) VALUES('$postID','$userID',now())");

            // Getting the user_id of the user whose post is liked
            $whosePostQuery = queryFunc("SELECT user_id from posts where post_id='$postID'");
            $whosePost = isRecord($whosePostQuery);

            // Creating notification
            notification($userID, $whosePost['user_id'], $postID, 'liked');
        }

        //Getting total number of likes for a post
        $likesResult = queryFunc("SELECT count(*) as count from likes where post_id='$postID'");
        $likes = isRecord($likesResult);

        // Sending likes count as a response to AJAX call
        echo $likes['count'];

    }

} elseif (isset($_GET['comment'])) {

    $userID = $_SESSION['user_id']; //Current User who is commenting
    $postID = $_POST['post_id']; // Post being commented
    $comment = $_POST['comment']; // Comment text

// Passing above values to this function and getting the ID of newly inserted comment as a result.
    $commentID = addComment($userID, $postID, $comment);

// Giving commentID back to ajax function as a response so it can be added to the post without reloading
    echo $commentID;

} elseif (isset($_GET['deletePost'])) {

    // For deleting post
    if ($_GET['id']) {
        $postID = $_GET['id']; // ID of the post to be deleted

        // Function to call for the deletion of post with post ID
        if (deletePost($postID)) {
            echo 'Post Deleted';
        }
    }
} elseif (isset($_GET['deleteComment'])) {
    // When user deletes the comment
    if ($_GET['id']) {
        $commentID = $_GET['id']; // ID of the deleted comment

        // Function called to delete the comment with given ID
        if (deleteComment($commentID)) {
            echo 'Comment Deleted';
        }
    }
} elseif (isset($_GET['editComment'])) {

    global $connection;
    $comment_body = mysqli_real_escape_string($connection, $_POST['comment']);
    $comment_id = $_POST['comment_id'];
    queryFunc("UPDATE comments set comment = '{$comment_body}', edited = 1 where comment_id ={$comment_id}");
} elseif (isset($_GET['editPost'])) {

    if (isset($_POST['postID'])) {
        global $connection;
        $post_body = mysqli_real_escape_string($connection, $_POST['postContent']);
        $post_id = $_POST['postID'];
        $action = $_POST['action'];

        if ($action == "new") {
            // Adding new pic to post
            $name = $_FILES['file']['name'];
            $tmp_name = $_FILES['file']['tmp_name'];
            $type = $_FILES['file']['type'];
            $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION)); // Getting extension of file
            $uniqueID = uniqid();

            // Checking the format of the image uploaded
            if (($extension == "jpg" || $extension == "jpeg" || $extension == "png") && ($type == "image/png" || $type == "image/jpeg")) {

                // Location where to save the image
                $location = 'assets/postPics/';
                if (move_uploaded_file($tmp_name, $location . $uniqueID . '.' . $extension)) {
                    $path = $location . $uniqueID . '.' . $extension;
                }
            }
        }
        if ($action == "keep") {
            // Keeping the current post pic
            queryFunc("UPDATE posts set post = '{$post_body}', edited = 1 where post_id ={$post_id}");
            $picPathQuery = queryFunc("SELECT pic from posts where post_id = {$post_id}");
            $picPath = isRecord($picPathQuery);
            // If path is null then store ""
            $path = ($picPath['pic'] != "") ? $picPath['pic'] : "";
        } else if ($action == 'editText') {
            // If only text is edited
            $path = "";
        } else {
            if ($action == "remove") // if pic is removed
            {
                $path = "";
            }

            queryFunc("UPDATE posts set post = '{$post_body}', edited = 1, pic='{$path}' where post_id ={$post_id}");
        }
        echo $path;
    }

} elseif (isset($_GET['post'])) {

    // Addding new post

    if (isset($_POST['post'])) {
        if (isset($_FILES['file']['name'])) {
            // Calling function to add post
            $name = $_FILES['file']['name']; // name of pic
            $tmp_name = $_FILES['file']['tmp_name'];
            $type = $_FILES['file']['type'];
            $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION)); // Getting extension of file

            // Unique ID for image for storing
            $uniqueID = uniqid();

            if (isset($name)) {
                if (!empty($name)) {
                    // Checking the format of the image uploaded
                    if (($extension == "jpg" || $extension == "jpeg" || $extension == "png") && ($type == "image/png" || $type == "image/jpeg")) {
                        // Location where to save the image
                        $location = 'assets/postPics/';
                        if (move_uploaded_file($tmp_name, $location . $uniqueID . '.' . $extension)) {
                            $path = $location . $uniqueID . '.' . $extension; //Complete path of image
                            newPost($_POST['post'], $path);
                        }
                    }
                }
            }
        } else {
            // If no picture was attached with post
            newPost($_POST['post']);
        }
    }

} elseif (isset($_GET['likeUsers'])) {

    // Getting the name of the persons who liked a certain post
    if (isset($_GET['postID'])) {
        $postID = $_GET['postID']; // ID of the post

        // Getting all likes of that particular post
        $queryResult = queryFunc("SELECT user_id FROM likes WHERE post_id='$postID'");
        $counter = 0;
        if (isData($queryResult)) {
            while ($row = isRecord($queryResult)) {
                $userID = $row['user_id']; // Getting id of each user who liked the post

                // Getting name of that user
                $queryName = queryFunc("SELECT CONCAT(first_name,' ',last_name) as name FROM users WHERE user_id='$userID'");

                $nameResult = isRecord($queryName);
                $name = $nameResult['name']; // name of that user

                // Inserting user name in array
                $data[$counter] = array('name' => $name);

                // Moving to the next user by incrementing
                $counter += 1;
            }

            // Simple converting the array to JSON format and passing it
            echo json_encode($data);

        } else { // If there were no data
            echo '{"notEmpty" : "Bilal"}';
        }
    }
} elseif (isset($_GET['pic'])) {

    if (isset($_FILES['profile_pic'])) {
        // When profile pic is uploaded

        $name = $_FILES['profile_pic']['name'];
        $tmp_name = $_FILES['profile_pic']['tmp_name'];
        $type = $_FILES['profile_pic']['type'];
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION)); // Getting extension of file

        // $typeImage = explode('/', $type);
        $uniqueID = uniqid();

        if (isset($name)) {
            if (!empty($name)) {
                // Checking the format of the image uploaded
                if (($extension == "jpg" || $extension == "jpeg" || $extension == "png") && ($type == "image/png" || $type == "image/jpeg")) {
                    // Location where to save the image
                    $location = 'assets/profile_pictures/';
                    if (move_uploaded_file($tmp_name, $location . $uniqueID . '.' . $extension)) {
                        $path = $location . $uniqueID . '.' . $extension;
                        profilePicChange($path);
                        echo $path;
                    }
                }
            }
        }

    } elseif (isset($_FILES['cover_pic'])) {
        $name = $_FILES['cover_pic']['name'];
        $tmp_name = $_FILES['cover_pic']['tmp_name'];
        $type = $_FILES['cover_pic']['type'];
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION)); // Getting extension of file

        // $typeImage = explode('/', $type);
        $uniqueID = uniqid();

        if (isset($name)) {
            if (!empty($name)) {
                // Checking the format of the image uploaded
                if (($extension == "jpg" || $extension == "jpeg" || $extension == "png") && ($type == "image/png" || $type == "image/jpeg")) {
                    // Location where to save the image
                    $location = 'assets/cover_pictures/';
                    if (move_uploaded_file($tmp_name, $location . $uniqueID . '.' . $extension)) {
                        $path = $location . $uniqueID . '.' . $extension;
                        coverPicChange($path);
                        echo $path;
                    }
                }
            }
        }
    }

} elseif (isset($_GET['search'])) {

    //Passing input value and flag to the search functiom
    getSearchedUsers($_POST['query'], $_POST['flag']);
} elseif (isset($_GET['dpCount'])) {

    $place = $_GET['dpCount'];
    $class = $_GET['class'];

    $value = CountDropdown($place);
    countDropdownDisplay($value, $class);
    // echo $value . ' ' . $class;

}
