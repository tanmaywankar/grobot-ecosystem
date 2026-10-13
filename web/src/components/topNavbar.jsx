
import {Bell, ChevronDown} from 'lucide-react';
export default function TopNavbar({logoUrl, placeholder}){
return(
    <div className="w-full h-20 bg-cover flex flex-row justify-between items-center ">
     <img src={logoUrl} className="h-20 w-max opacity-50 object-cover " alt="Grobot logo" />
     <div className='mr-5 flex flex-row items-center'>
        <div className='size-14 flex items-center justify-center bg-card rounded-full'>
            <Bell size={28} strokeWidth={1.5}/>
        </div>
        <div className='ml-5 p-2 bg-card rounded-full items-center flex flex-row'>
            <img src={placeholder} alt="userplaceholder" className='size-10 rounded-full border-4 border-mint' />
            <ChevronDown size={28} strokeWidth={1.5} className='ml-1' />
        </div>
     </div>
    </div>
);
}