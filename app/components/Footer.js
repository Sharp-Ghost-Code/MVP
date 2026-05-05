export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20">
      <div className="py-16 px-margin max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-md">
          <div className="font-title-sm text-title-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">directions_car</span>
            Car Recommender
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[20rem] leading-relaxed">
            Helping you make the smartest vehicle investment based on real-world data and total
            ownership costs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-xl">
          <div className="flex flex-col gap-md">
            <span className="font-label-caps text-on-surface font-bold">Product</span>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Comparison Tool
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Budget Planner
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              API Access
            </a>
          </div>
          <div className="flex flex-col gap-md">
            <span className="font-label-caps text-on-surface font-bold">Company</span>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              About Us
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Contact Expert
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Press Kit
            </a>
          </div>
          <div className="flex flex-col gap-md">
            <span className="font-label-caps text-on-surface font-bold">Resources</span>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Data Sources
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Blog
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Support
            </a>
          </div>
          <div className="flex flex-col gap-md">
            <span className="font-label-caps text-on-surface font-bold">Legal</span>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">
              Terms of Use
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-margin py-8 border-t border-outline-variant/10 text-center text-body-sm text-on-surface-variant/60">
        © 2024 Car Recommender. All rights reserved.
      </div>
    </footer>
  )
}
