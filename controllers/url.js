const {nanoid}=require("nanoid");
//we use {} bcoz we only need nanoid function but we can also do
//const nanoidPackage=require("nanoid");
//but we need to use it as nanoidPackage.nanoid
const URL=require("../models/url");
async function generateNewShortUrl(req,res){
        const body=req.body;
        if(!body.url) return res.status(400).json({error:"url is required"});
        const shortId=nanoid(8);  
        await URL.create({
            shortId:shortId,
            redirectUrl:body.url,
            visitHistory:[],
            createdBy:req.user._id,
        });
         const allUrls = await URL.find({});
      return res.render("home",{
         id: shortId,
        urls: allUrls,
        req: req
      });
}
async function handleGetAnalytics(req,res) {
    const shortId=req.params.shortId;
    const result=await URL.findOne({shortId});
    return res.json({
        totalClicks:result.visitHistory.length,
        analytics:result.visitHistory,
    })
}
module.exports={
    generateNewShortUrl,
    handleGetAnalytics,
}