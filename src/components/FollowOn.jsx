import { FaGithub, FaGlobe, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const FollowOn = () => {
  return (
    <>
      <div className="fadded-text pt-2">
        <span>Follow on:</span>
        <div className="flex gap-4 pt-3">
          <a href="https://www.linkedin.com/in/clevercoderjoy/" target="_blank">
            <FaLinkedinIn size={20} />
          </a>
          <a href="https://github.com/clevercoderjoy" target="_blank">
            <FaGithub size={20} />
          </a>
          <a href="https://www.twitter.com/clevercoderjoy" target="_blank">
            <FaXTwitter size={20} />
          </a>
          <a href="https://clevercoderjoy.bio.link" target="_blank">
            <FaGlobe size={20} />
          </a>
        </div>
      </div>
    </>
  )
}

export default FollowOn;