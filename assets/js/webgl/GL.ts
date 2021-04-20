import { 
    PerspectiveCamera,
    Clock,
    MeshBasicMaterial,
    Mesh,
    DirectionalLight,
    AmbientLight,
    TorusKnotGeometry
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Scene from './core/Scene'
import Renderer from './core/Renderer'
import Bubble from './custom/Bubble'
import Stats from '../utils/dev/Stats'
import EventBus from '../utils/EventBus'
import Sky from './custom/Sky'
import { GLEvents } from '../utils/GLEvents'
import Tracker from '../utils/dev/Tracker'


interface Size {
    width: number
    height: number
    ratio: number
}

class GL {
    private static instance: GL
    canvas: HTMLCanvasElement
    scene: Scene 
    renderer: Renderer 
    camera: PerspectiveCamera
    controls: OrbitControls
    clock: Clock
    size: Size

    sphereCamera: any
    hdrCubeRenderTarget: any
    hdrEquirect: any

    constructor() {
        Stats.showPanel(0)
        document.body.appendChild(Stats.dom)

        this.size = {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.innerWidth / window.innerHeight
        }

        this.canvas = document.querySelector('.webgl') as HTMLCanvasElement
        if (this.canvas) {
            this.canvas.width = this.size.width
            this.canvas.height = this.size.height
        }

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(45, this.size.width / this.size.height, 0.1, 1000)
        this.camera.position.z = 5

        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        this.clock = new Clock()

        this.renderer = new Renderer({ 
                canvas: this.canvas,
                alpha: false,
                antialiasing: true
            }, 
            this.size.width, 
            this.size.height
        )
        this.renderer.render(this.scene, this.camera)

        this.addElements()
        this.addEvents()

        this.animate()
    }

    public static getInstance(): GL {
        if (!GL.instance) {
            GL.instance = new GL()
        }
 
        return GL.instance
    }

    // ---------------- METHODS

    addElements() {
        this.scene.add( this.camera )

        // TODO : Should not be here at the end, should rather be in Scene.ts

        const boxGeometry = new TorusKnotGeometry( 1, 1, 5, 32 );
        const boxMaterial = new MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
        const box2 = new Mesh( boxGeometry, boxMaterial )
        this.scene.add( box2 )
        box2.position.x = 10
        const box3 = new Mesh( boxGeometry, boxMaterial )
        this.scene.add( box3 )
        box3.position.x = -10

        const b = new Bubble( 1, 12, this.scene, this.renderer )
        this.scene.add( b.mesh )

        const sky = new Sky( this.canvas.width, this.canvas.height )
        this.scene.add( sky.mesh )

        this.createLights()
    }

    addEvents() {
        window.addEventListener( 'resize', this.resize.bind(this) )
        this.controls.addEventListener('change', () => {
            EventBus.emit(GLEvents.UPDATE_CUBE_CAMERA)
        })
    }  
    
    resize() {
        this.size.width = window.innerWidth
        this.size.height = window.innerHeight

        this.camera.aspect = this.size.width / this.size.height
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( this.size.width, this.size.height )

        this.camera.updateProjectionMatrix()
    }

    createLights() {
        const ambientLight = new AmbientLight(0xaa54f0, 1)
      
        const directionalLight1 = new DirectionalLight(0xffffff, 1)
        directionalLight1.position.set(-2, 2, 5)
      
        const directionalLight2 = new DirectionalLight(0xfff000, 1)
        directionalLight2.position.set(-2, 4, 4)
        directionalLight2.castShadow = true
      
        this.scene.add(ambientLight, directionalLight1, directionalLight2)
    }

    // ---------------- LIFECYCLE

    animate() {
        Stats.update()

        window.requestAnimationFrame( this.animate.bind(this) )

        this.render()
    }

    render() {
        const elapsedTime = this.clock.getElapsedTime()

        this.controls.update()

        Tracker.update( this.renderer.info.render )
        EventBus.emit(GLEvents.UPDATE, { elapsedTime: elapsedTime })

        this.renderer.render( this.scene, this.camera )
    }
}

export default GL