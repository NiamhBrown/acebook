import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { getPosts } from "../../services/posts";
import { updateUser } from "../../services/users";
import Post from "../Post/Post";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import Navbar from "../../components/navbar/navbar";
import ProfilePictureUpload from "../ProfilePicture/ProfilePictureUpload";
import { getOneUser } from "../../services/users";
import FriendsPage from "../../pages/Friend/FriendsPage";
import EditProfileForm from "./EditProfileForm";

export const Profile = () => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [signedInUser, setSignedInUser] = useState({
    forename: "loading",
    username: "loading",
  });

  useEffect(() => {
    if (token) {
      getPosts(token)
        .then((data) => {
          const posts = data.posts.filter((post) => {
            return post.user === userId;
          });
          setPosts(posts);
          setToken(data.token);
        })
        .catch((err) => {
          console.error(err);
          navigate("/login");
        });
    }
  }, []);

  useEffect(() => {
    if (token) {
      getOneUser(token)
        .then((data) => {
          setSignedInUser(data.user[0]);
          localStorage.setItem("token", data.token);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSave = async (updatedUser) => {
    try {
      console.log("User updated:", updatedUser);
      const token = localStorage.getItem("token");
      await updateUser(updatedUser, token);
      closeModal();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  //   const handleSave = async (updatedData) => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       const updatedUser = await updateUserProfile(updatedData, token);
  //       setUser(updatedUser);
  //       setShowModal(false);
  //     } catch (error) {
  //       console.error("Error updating user profile:", error);
  //     }
  //   };
  return token ? (
    <>
      <Navbar />
      <main className="profile-main">
        <div className="modal">
          <button onClick={openModal}>Edit Profile</button>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Edit Profile"
          >
            <h2>Edit Profile</h2>
            <EditProfileForm
              user={signedInUser}
              onSave={handleSave}
              onClose={closeModal}
            />
          </Modal>
        </div>
        <div className="profile-header">
          <ProfilePicture userId={userId} />
          <ProfilePictureUpload token={token} />
          <h1>
            {signedInUser.forename} {signedInUser.surname}
          </h1>
        </div>
        <h2 className="post-heading">Posts</h2>
        <div className="profile-container" role="profile">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              token={token}
              user={signedInUser}
            />
          ))}
          <FriendsPage />
        </div>
      </main>
    </>
  ) : null;
};

export default Profile;
