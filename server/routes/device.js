import {Router} from "express";
import {z} from "zod";
import crypto from "crypto";
import {prisma} from "../db.js";
import {authGuard} from "../middleware/authGuard.js"

const router = Router();

const DeviceSchema = z.object({
    name: z.string().min(2, "Device name must be minimum 2 charecters"),
    plantType: z.string().optional(),
});

router.post("/", authGuard, async (req, res)=>{

    const validation = DeviceSchema.safeParse(req.body);
    if(!validation.success){
        return res.status(400).json({
            success: false,
            error: "invalid or missing fields",
        })
    }

    const apiKey = `gb_${crypto.randomBytes(24).toString("hex")}`;
    const {name, plantType} = validation.data;
    try{
       const newDevice = await prisma.device.create({
            data:{
                name,
                plantType: plantType || "general",
                apiKey,
                userId: req.user.userId,
            }
        });

    return res.status(201).json({
        success: true,
        message: "device registered successfully",
        device: newDevice,
    });

    }

    catch (err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: "failed to register device",
        });
    }


});

export default router;