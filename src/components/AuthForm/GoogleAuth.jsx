import { Flex, Image, Text } from "@chakra-ui/react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase/firebase";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GoogleAuth = ({ prefix }) => {
	const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const handleGoogleAuth = async () => {
		try {
			const result = await signInWithGoogle();
			if (result && result.user) {
				const user = result.user;
				const userRef = doc(firestore, "users", user.uid);
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					// login
					const userDoc = userSnap.data();
					localStorage.setItem("user-info", JSON.stringify(userDoc));
					loginUser(userDoc);
				} else {
					// signup
					const userDoc = {
						uid: user.uid,
						email: user.email,
						username: user.email.split("@")[0],
						fullName: user.displayName,
						bio: "",
						profilePicURL: user.photoURL,
						followers: [],
						following: [],
						posts: [],
						createdAt: Date.now(),
					};
					await setDoc(doc(firestore, "users", user.uid), userDoc);
					localStorage.setItem("user-info", JSON.stringify(userDoc));
					loginUser(userDoc);
				}
			} else {
				if (error) {
					showToast("Error", error.message, "error");
				}
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"} onClick={handleGoogleAuth}>
			<Image src='/google.png' w={5} alt='Google logo' />
			<Text mx='2' color={"blue.500"}>
				{prefix} with Google
			</Text>
		</Flex>
	);
};

export default GoogleAuth;
