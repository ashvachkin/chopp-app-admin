import { PropsWithChildren, ReactNode } from 'react';
import { Button, Modal } from 'antd';
import { ButtonColorType, ButtonVariantType } from 'antd/es/button';

type Props = {
  open: boolean;
  title?: ReactNode;
  width?: string | number;
  loading?: boolean;
  okTitle?: string;
  okType?: 'primary' | 'link' | 'text' | 'default' | 'dashed';
  okColor?: ButtonColorType;
  okVariant?: ButtonVariantType;
  onOk: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  open,
  onOk,
  okTitle,
  okColor,
  okType = 'primary',
  okVariant = 'solid',
  onCancel,
  title,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <Modal
      zIndex={1000}
      open={open}
      title={title}
      onOk={onOk}
      onCancel={onCancel}
      // @ts-ignore
      footer={(_: any, { OkBtn, CancelBtn }: any) => (
        <>
          <CancelBtn />
          {okTitle ? (
            <Button color="danger" type={okType} variant={okVariant} onClick={onOk}>
              {okTitle}
            </Button>
          ) : (
            <OkBtn />
          )}
        </>
      )}>
      {children}
    </Modal>
  );
};
