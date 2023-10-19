const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).select("-__v -password");
        // returns everything BUT password
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (_parent, { bookData }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { savedBooks: { book: bookData } } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("Please login");
    },
    removeBook: async (_parent, { bookId }, context) => {
      return User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { saveBookss: { _id: bookId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
