import React from 'react';
import { ArrowLeft, Car, ChevronRight, LogOut, Menu, MonitorPlay, X } from 'lucide-react';

const managementViews = ['Users', 'Settings', 'Owner Recycle Bin'];

export default function WorkspaceNavigation({ items, activeView, onNavigate, shopName, onLogout, demoMode, portfolioUrl }) {
  const dialog = React.useRef(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const desktop = window.matchMedia('(min-width: 841px)');
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  function navigate(view) {
    onNavigate(view);
    dialog.current?.close();
  }

  const brand = (
    <div className="workspace-brand">
      <span className="workspace-brand-mark"><Car size={23} strokeWidth={1.7} /></span>
      <div><strong>{shopName}</strong><span>Retail workspace</span></div>
    </div>
  );

  function navigation() {
    return (
      <>
        <nav className="workspace-nav" aria-label="Main navigation">
          {['Workspace', 'Management'].map(group => {
            const groupItems = items.filter(item => managementViews.includes(item.label) === (group === 'Management'));
            if (!groupItems.length) return null;
            return (
              <div className="workspace-nav-group" key={group}>
                <span className="workspace-nav-label">{group}</span>
                {groupItems.map(({ label, icon: Icon }) => (
                  <button key={label} type="button" className={`workspace-nav-item${activeView === label ? ' is-active' : ''}`}
                    onClick={() => navigate(label)} aria-current={activeView === label ? 'page' : undefined}>
                    <Icon size={19} strokeWidth={1.7} />
                    <span>{label === 'Owner Recycle Bin' ? 'Recycle bin' : label === 'POS Scanner' ? 'Point of sale' : label}</span>
                    {activeView === label && <ChevronRight size={15} />}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="workspace-nav-footer">
          {demoMode && <span className="workspace-demo-label"><MonitorPlay size={16} /> Portfolio demo</span>}
          {demoMode && <a href={portfolioUrl} className="workspace-nav-item"><ArrowLeft size={18} /><span>Back to portfolio</span></a>}
          <button type="button" className="workspace-nav-item" onClick={() => { dialog.current?.close(); onLogout(); }}>
            <LogOut size={18} /><span>Sign out</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <aside className="app-navigation">{brand}{navigation()}</aside>
      <div className="workspace-mobile-bar">
        {brand}
        <button type="button" className="mobile-menu-button" aria-label="Open navigation" title="Open navigation"
          aria-expanded={open} aria-controls="mobile-navigation" onClick={() => { dialog.current.showModal(); setOpen(true); }}>
          <Menu size={22} />
        </button>
      </div>
      <dialog ref={dialog} id="mobile-navigation" className="workspace-nav-dialog" aria-label="Navigation"
        onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
        <div className="workspace-drawer">
          <div className="workspace-drawer-heading">
            <strong>{shopName}</strong>
            <button type="button" className="mobile-menu-button" aria-label="Close navigation" title="Close navigation" onClick={() => dialog.current.close()}><X size={20} /></button>
          </div>
          {navigation()}
        </div>
      </dialog>
    </>
  );
}
