const Joi = require("joi");

const listingschema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null),
    price: Joi.number().required().min(1),
    location: Joi.string().required(),
    country: Joi.string().required(),
    category: Joi.string()
      .valid("Trending","Adventure","Nature","City","Beach","Relax","Sports","Food","Nightlife","Favorites")
      .required()
  }).required()
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).default(3),
    comment: Joi.string().required()
  }).required()
});

module.exports = { listingschema, reviewSchema };
