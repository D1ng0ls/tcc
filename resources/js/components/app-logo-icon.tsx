import { SVGAttributes } from 'react';
import logo from '../assets/logo.png';

export default function AppLogoIcon({className} : any) {
    return (
        <img src={logo} alt="Logo" className={className}/>
    );
}
