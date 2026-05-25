import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { Fragment } from 'react';

type Props = {
    url: string | null;
    onClose: () => void;
};

export default function ProofImageModal({ url, onClose }: Props) {
    return (
        <Transition appear show={Boolean(url)} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-navy-blue/80 backdrop-blur-sm"
                        aria-hidden="true"
                    />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="relative max-h-[90vh] max-w-[90vw]">
                            {url && (
                                <img
                                    src={url}
                                    alt="Bukti transfer pelanggan"
                                    className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
                                />
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Tutup bukti transfer"
                                className="absolute -top-3 -right-3 rounded-full bg-base-white p-2 shadow-md transition hover:bg-surface-gray"
                            >
                                <X
                                    className="h-5 w-5 text-navy-blue"
                                    aria-hidden="true"
                                />
                            </button>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
