const mongoose = require('mongoose')
const validator = require('validator').default
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid')
        }
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"')
        }
      }
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Age cannot be negative number')
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

// Virtual tasks variable
userSchema.virtual('tasks', {
  ref: 'Tasks',
  localField: '_id',
  foreignField: 'owner'
})

// Remove password and tokens when getting user profile
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}

// Generate JWT Token
userSchema.methods.generateAuthToken = async function() {
  const SECRET_TOKEN = 'SomeSecretTokenShit'

  const token = jwt.sign({ _id: this._id.toString() }, SECRET_TOKEN)

  this.tokens = this.tokens.concat({ token })
  await this.save()

  return token
}

// Find credentials via email and password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8)
  }

  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
  await Task.deleteMany({ owner: this._id })

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
