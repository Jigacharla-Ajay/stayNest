const Joi=require("joi");
module.exports.listingSchema=Joi.object({
    listing: Joi.object({
        title: Joi.string().required(), 
        description: Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(1),
        image:Joi.string().allow("",null),
        // tags may be submitted as a comma-separated string or as an array of strings
        tags: Joi.alternatives().try(
            Joi.string().allow('', null),
            Joi.array().items(Joi.string())
        )
    }).required()
})
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        review:Joi.string().required(),
        Rating:Joi.number().required().min(1).max(5)
    }).required()   
})    