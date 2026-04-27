import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

const _zee = new Vector3( 0, 0, 1 );
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 um die X-Achse

class DeviceOrientationControls {
    constructor( object ) {
        this.object = object;
        this.object.rotation.reorder( 'YXZ' );
        this.enabled = true;
        this.deviceOrientation = {};
        this.screenOrientation = 0;
        this.alphaOffset = 0; // in Radiant

        this.onDeviceOrientationChangeEvent = ( event ) => {
            this.deviceOrientation = event;
        };

        this.onScreenOrientationChangeEvent = () => {
            this.screenOrientation = window.orientation || 0;
        };

        this.connect();
    }

    connect() {
        this.onScreenOrientationChangeEvent(); // Einmal beim Start ausführen
        window.addEventListener( 'orientationchange', this.onScreenOrientationChangeEvent );
        window.addEventListener( 'deviceorientation', this.onDeviceOrientationChangeEvent );
        this.enabled = true;
    }

    disconnect() {
        window.removeEventListener( 'orientationchange', this.onScreenOrientationChangeEvent );
        window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChangeEvent );
        this.enabled = false;
    }

    update() {
        if ( this.enabled === false ) return;

        const device = this.deviceOrientation;

        if ( device ) {
            const alpha = device.alpha ? MathUtils.degToRad( device.alpha ) + this.alphaOffset : 0; // Z
            const beta = device.beta ? MathUtils.degToRad( device.beta ) : 0; // X'
            const gamma = device.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''
            const orient = this.screenOrientation ? MathUtils.degToRad( this.screenOrientation ) : 0; // O

            this.setObjectQuaternion( this.object.quaternion, alpha, beta, gamma, orient );
        }
    }

    setObjectQuaternion( quaternion, alpha, beta, gamma, orient ) {
        _euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' für das Gerät, aber 'YXZ' für uns
        quaternion.setFromEuler( _euler ); // Gerät ausrichten
        quaternion.multiply( _q1 ); // Kamera schaut aus der Rückseite des Geräts, nicht nach oben
        quaternion.multiply( _q0.setFromAxisAngle( _zee, - orient ) ); // Bildschirmausrichtung anpassen
    }

    dispose() {
        this.disconnect();
    }
}

export { DeviceOrientationControls };