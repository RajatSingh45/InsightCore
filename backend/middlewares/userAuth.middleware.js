import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js'

const userAuth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization
      const token = req.cookies?.token || (authHeader && authHeader.split(' ')[1])

      if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided" })
      }

      const decodeToken = jwt.verify(token, process.env.SECRET_KEY)

      if (!decodeToken) {
        return res.status(401).json({ message: "Unauthorized - Invalid token" })
      }

      const user = await userModel.findById(decodeToken._id)

      if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" })
      }

      if (roles.length && !roles.includes(decodeToken.role)) {
        return res.status(403).json({ message: "Not allowed for this right" })
      }

      req.user = user
      return next()
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" })
    }
  }
}

export default userAuth