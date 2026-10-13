
import {Bell} from 'lucide-react';
export default function TopNavbar({logoUrl, placeholder}){
return(
    <div className="w-full h-20 bg-cover flex flex-row justify-between items-center ">
     <img src={logoUrl} className="h-20 w-max opacity-50 object-cover " alt="Grobot logo" />
     <div className='mr-5 flex flex-row'>
        <div className='p-3 bg-card rounded-full'>
            <Bell size={28} strokeWidth={1.5}/>
        </div>
        <div className='ml-5 p-2'>
            <img src={placeholder} alt="userplaceholder" className='size-10 rounded-full border-4 border-mint' />
        </div>
     </div>
    </div>
);
}